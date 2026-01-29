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
    album_name: "album name"
}

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
        console.log(limit);
        if (limit < 100) {
            console.log("Final batch");
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

            console.log(playlistName, artistName, trackName, albumName);
            data.push([playlistName, artistName, trackName, albumName]);
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

// Given all playlists find and return the liked songs playlist
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

// Get playlist, songname, artist, album name for all playlists
async function getAllPlaylistSongs() {
    const retrievedPlaylists = await getPlaylists();
    for (let index = 0; index < retrievedPlaylists.total; index++) {
        const element = retrievedPlaylists.items[index];
        const tracks = await getPlaylistTracks(element.id)
        console.log(element.name);
        for (let j = 0; j < tracks.total; j++) {
            const track = tracks.items[j];
            const playlistName = element.name;

            let artistName = "";
            try {
                artistName = track.track.artists[0].name;
            }
            catch (err) {
                continue; // Bad track, skip record
            }
            
            const trackName = track.track.name;
            const albumName = track.track.album.name;

            console.log(playlistName, artistName, trackName, albumName);
            data.push([playlistName, artistName, trackName, albumName]);
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

await getLikedSongs();
// await getAllPlaylistSongs();

