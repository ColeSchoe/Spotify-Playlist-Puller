# Spotify Playlist Puller

## 1.2 Release Notice
Version 1.2 of the Spotify Playlist Puller is fully up and running! Now you can choose to only gather your liked songs copy playlist or gather all songs from each playlist. The tool now gathers each of the following datapoints:  

<ul>
<li>Playlist Name</li>
<li>Song Name</li>
<li>Artist</li>
<li>Album Name</li>
<li>Time Added to Playlist</li>
</ul>

To gather all songs run the script with the "all" argument like so:  
```node script.js all```

To gather only songs from the "Liked Songs Copy" playlist, use "liked" as the argument to script.js like so:  
```node script.js liked```

## Required Software

Node.js: https://nodejs.org/en/download  

<ul>

<li>  
Default config on this page should work for Windows machines 
</li>

<li>  
Use the .msi installer, default options should work 
</li>

</ul>

## Convert Your Liked Songs into a Playlist

### Via the Desktop Client

Go to your liked songs  

Ctrl + A -> right click -> "Add to Playlist" -> create a new playlist called "Liked Songs Copy"

### Via the Web Client

Go to your liked songs

Click the first song -> Go all the way to the bottom of the list -> Ctrl + left click the last song -> "Add to Playlist" -> create a new playlist called "Liked Songs Copy"  

## How to Use

### Getting Your Access Token

Download software package from GitHub

Go to https://developer.spotify.com/

Sign in using your Spotify account

Click the "See it in action" button or scroll down

Copy the value after ```const token =``` on line 2 (with quotations)

In the project directory, open .env with notepad

Now paste the copied token value directly after the "="  
&emsp;NOTE: This token is only valid for 1 hour, you will have to grab this token again after an hour

### Running the Script

Open the project directory in terminal

Run the following command to install dependencies:  
```npm i```

Run the following command with the applicable subcommand to run the script:  
```node script.js all``` - (To gather all songs from all playlists)  
```node script.js liked``` - (To gather all liked songs from copy playlist "Liked Songs Copy")

Check the project directory for a CSV file containing your collected song info, it should be called "liked-songs.csv" when gathering "Liked Songs Copy" and "playlist-songs.csv" when gathering all songs from all playlists
