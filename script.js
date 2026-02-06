import { stringify } from 'csv-stringify';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TOKEN;

// CSV data being temporarily stored in an array, also declaring columns

let data = []
let columns = {
    playlist: "playlist",
    song_name: "song name",
    artist: "artist",
    album_name: "album name",
    added_at: "added at"
}

// ---- Functions handling web requests ----

async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  console.log(res.status);
  console.log(res.headers);
  return await res.json();
}

async function getPlaylists(){
    const { id: user_id } = await fetchWebApi('v1/me', 'GET')

    return (fetchWebApi(
        `v1/users/${user_id}/playlists`, 'GET'
    ));
}

async function getPlaylistTracks(playlistID, offset=0, limit=100){
    return (fetchWebApi(
        `v1/playlists/${playlistID}/tracks?offset=${offset}&limit=${limit}`, 'GET'
    ));  
}

// ---- Functions handling core logic ----

// WORK IN PROGRESS - Find a playlist ID by name
async function getPlaylistID(name) {
    let offset = 0;
    let limit = 50;

    const retrievedPlaylists = await getPlaylists();
    const total = retrievedPlaylists.total;

    console.log(retrievedPlaylists.total);

    // Can only fetch 50 playlists at a time, need to use an offset when pulling playlists
    // Need to actually call getPlaylists in this loop using the offset and limit values as url params
    while (offset < total) {
        for (let i = 0; i < retrievedPlaylists.total; i++) {
            const playlist = retrievedPlaylists.items[i];
            console.log(playlist.name);
            if (playlist.name === name) {
                return playlist.id;
            }
        }

        offset += 50;

        if (total - offset < 50) {
            limit = total - offset;
        }
    }

    return "err";
}

// Given all playlists find and return the liked songs playlist, linear search
async function getLikedSongsPlaylist() {
    const retrievedPlaylists = await getPlaylists();
    for (let i = 0; i < retrievedPlaylists.total; i++) {
        const playlist = retrievedPlaylists.items[i];
        console.log(playlist.name);
        if (playlist.name === "Liked Songs Copy") {
            return playlist.id;
        }
    }

    return "err";
}

// WORK IN PROGRESS - Save songs from a single named playlist
async function getPlaylistSongsByName(name) {
    const filename = 'songs.csv'; // filename for saved songs
    let offset = 0;
    let limit = 100;
    const playlistID = await getPlaylistID(name);

    if (playlistID === "err") {
        console.log("Invalid playlist name! Stopping program.");
        return;
    }
    
    const songs = await getPlaylistTracks(playlistID, offset);
    const total = songs.total;
    console.log(songs);
    console.log("Total: ", total);

    // api only allows 100 records to be extracted at a time
    while (offset < total)
    {
        if (limit < 100) {
            console.log("Final batch for liked songs");
        }
        
        const tracks = await getPlaylistTracks(playlistID, offset, limit);

        for (let i = 0; i < tracks.total; i++) {
            const track = tracks.items[i];

            let artistName = "";
            try {
                artistName = track.track.artists[0].name;
            }
            catch (err) {
                continue; // Bad track, skip record
            }
            
            const trackName = track.track.name;
            const albumName = track.track.album.name;
            const addedAtTime = track.added_at;

            console.log(name, artistName, trackName, albumName, addedAtTime);
            data.push([name, artistName, trackName, albumName, addedAtTime]);
        }

        offset += 100;

        // Adjust limit for final batch of tracks
        if (total - offset < 100) {
            limit = total - offset;
        }
    }

    // Write data to csv file
    stringify(data, { header: true, columns: columns }, (err, output) => {
        if (err) throw err;
        fs.writeFile(filename, output, (err) => {
            if (err) throw err;
            console.log(`songs.csv saved.`);
        });
    });
}

// Save liked songs
async function getLikedSongs() {
    const playlistName = "Liked Songs";
    let offset = 0;
    let limit = 100;
    const likedSongsID = await getLikedSongsPlaylist();
    
    const likedSongs = await getPlaylistTracks(likedSongsID, offset);
    const total = likedSongs.total;
    console.log(likedSongs);
    console.log("Total: ", total);

    // api only allows 100 records to be extracted at a time
    while (offset < total)
    {
        if (limit < 100) {
            console.log("Final batch for liked songs");
        }
        
        const tracks = await getPlaylistTracks(likedSongsID, offset, limit);

        for (let i = 0; i < tracks.total; i++) {
            const track = tracks.items[i];

            let artistName = "";
            try {
                artistName = track.track.artists[0].name;
            }
            catch (err) {
                continue; // Bad track, skip record
            }
            
            const trackName = track.track.name;
            const albumName = track.track.album.name;
            const addedAtTime = track.added_at;

            console.log(playlistName, artistName, trackName, albumName, addedAtTime);
            data.push([playlistName, artistName, trackName, albumName, addedAtTime]);
        }

        offset += 100;

        // Adjust limit for final batch of tracks
        if (total - offset < 100) {
            limit = total - offset;
        }
    }

    // Write data to csv file
    stringify(data, { header: true, columns: columns }, (err, output) => {
        if (err) throw err;
        fs.writeFile('liked-songs.csv', output, (err) => {
            if (err) throw err;
            console.log('liked-songs.csv saved.');
        });
    });
}

// Get playlist, songname, artist, album name for all playlists
async function getAllPlaylistSongs() {
    const retrievedPlaylists = await getPlaylists();

    // Go through all playlists
    for (let index = 0; index < retrievedPlaylists.total; index++) {
        let offset = 0;
        let limit = 100;
        const playlist = retrievedPlaylists.items[index];
        let total = -1;

        try {
            const tracks = await getPlaylistTracks(playlist.id, offset);
            total = tracks.total;
        } 
        catch (err) {
            console.log("Found invalid playlist, skipping to the next playlist");
            continue; // Invalid playlist, skip to the next playlist
        }

        console.log("Starting ", playlist.name);

        while (offset < total) {
            if (limit < 100) {
                console.log("Final batch for ", playlist.name);
            }

            const tracks = await getPlaylistTracks(playlist.id, offset, limit);

            for (let j = 0; j < tracks.total; j++) {
                const track = tracks.items[j];
                const playlistName = playlist.name;

                let artistName = "";
                try {
                    artistName = track.track.artists[0].name;
                }
                catch (err) {
                    continue; // Bad track, skip record
                }
                
                const trackName = track.track.name;
                const albumName = track.track.album.name;
                const addedAtTime = track.added_at;

                console.log(playlistName, artistName, trackName, albumName, addedAtTime);
                data.push([playlistName, artistName, trackName, albumName, addedAtTime]);
            }

            offset += 100;

            if (total - offset < 100) {
                limit = total - offset;
            }
        }
    }

    // --- Write data to csv file

    stringify(data, { header: true, columns: columns }, (err, output) => {
    if (err) throw err;
    fs.writeFile('playlist-songs.csv', output, (err) => {
        if (err) throw err;
        console.log('playlist-songs.csv saved.');
    });
    });

}

// --- Driver Code ---

console.log("Node project is running!");

const argument = process.argv[2];

if (argument == "liked"){
    console.log("Gathering all liked songs");
    await getLikedSongs();
}

else if (argument == "all"){
    console.log("Gathering all songs for all playlists");
    await getAllPlaylistSongs();
}

else if (typeof argument === "string") {
    console.log(`Gathering songs from playlist: ${argument}`);
    await getPlaylistSongsByName(argument);
}

else {
    console.log("Invalid argument...\nTo gather all songs, use subcommand \"all\"\nTo gather liked songs copy, use subcommand \"liked\"");
}