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

async function getPlaylists(offset=0, limit=50){
    const { id: user_id } = await fetchWebApi('v1/me', 'GET')

    return (fetchWebApi(
        `v1/users/${user_id}/playlists?offset=${offset}&limit=${limit}`, 'GET'
    ));
}

async function getPlaylistTracks(playlistID, offset=0, limit=100){
    return (fetchWebApi(
        `v1/playlists/${playlistID}/tracks?offset=${offset}&limit=${limit}`, 'GET'
    ));  
}

// ---- Functions handling core logic ----

// Find a playlist ID by name
async function getPlaylistID(name) {
    let offset = 0;
    let limit = 50;

    const retrievedPlaylists = await getPlaylists();
    const total = retrievedPlaylists.total;

    console.log("Total playlists: ", retrievedPlaylists.total);

    // Can only fetch 50 playlists at a time, need to use an offset when pulling playlists
    while (offset < total) {
        const playlists = await getPlaylists(offset, limit);

        for (let i = 0; i < playlists.total; i++) {
            const playlist = playlists.items[i];
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

// Record a given batch of tracks into array data, label with the given playlist name
function recordTracks(tracks, playlistName) {
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
}

// Record a batch of given playlists into array data
async function recordPlaylists(playlists) {
    for (let index = 0; index < playlists.total; index++) {
        let offset = 0;
        let limit = 100;
        const playlist = playlists.items[index];
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

            recordTracks(tracks, playlist.name);

            offset += 100;

            if (total - offset < 100) {
                limit = total - offset;
            }
        }
    }
}

function writeToCSV(filename) {
    stringify(data, { header: true, columns: columns }, (err, output) => {
        if (err) throw err;
        fs.writeFile(filename, output, (err) => {
            if (err) throw err;
            console.log(`${filename} saved`);
        });
    });
}

// Save songs from a single playlist identified by name
async function getPlaylistSongsByName(name) {
    const filename = 'songs.csv'; // filename for saved songs
    let offset = 0;
    let limit = 100;
    const playlistID = await getPlaylistID(name);

    // Could not name match playlist, close program
    if (playlistID === "err") {
        console.log(`>>> Playlist with name \"${name}\" not found! Closing program.`);
        return;
    }
    
    const songs = await getPlaylistTracks(playlistID, offset);

    // Stop program if returned playlist is undefined
    if (!songs) {
        console.log(`>>> Playlist ${name} is undefined! Closing program.`);
        return;
    }

    const total = songs.total;
    console.log("Total songs: ", total);

    // api only allows 100 records to be extracted at a time
    while (offset < total)
    {   
        const tracks = await getPlaylistTracks(playlistID, offset, limit);

        recordTracks(tracks, name);

        offset += 100;

        // Adjust limit for final batch of tracks
        if (total - offset < 100) {
            limit = total - offset;
        }
    }

    writeToCSV(filename);
}

// Get playlist, songname, artist, album name for all playlists
async function getAllPlaylistSongs() {
    const filename = "playlist-songs.csv";
    const retrievedPlaylists = await getPlaylists();
    const total = retrievedPlaylists.total;
    
    let limit = 50;
    let offset = 0;

    while (offset < total) {
        const currentPlaylists = await getPlaylists(offset, limit);

        recordPlaylists(currentPlaylists);

        offset += 50;

        if (total - offset < 50) {
            limit = total - offset;
        }
    }

    writeToCSV(filename);
}

// --- Driver Code ---

console.log("Node project is running!");

const argument = process.argv[2];

if (argument == "liked"){
    console.log("Gathering all liked songs");
    await getPlaylistSongsByName("Liked Songs Copy");
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
    console.log("Invalid argument...\nTo gather all songs, use subcommand \"all\"\nTo gather liked songs copy, use subcommand \"liked\"\nTo gather songs from a single playlist, use the name of the playlist enclosed in quotations like so: \"Rock Favorites\"");
}