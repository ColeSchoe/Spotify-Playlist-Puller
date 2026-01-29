# Spotify Playlist Puller

## 1.1 Release Notice
Version 1.1 of the Spotify Playlist Puller is fully up and running! Now you can choose to only gather your liked songs copy playlist or gather all songs from each playlist.  

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

In the desktop client for Spotify, go to your liked songs  

Ctrl + A -> right click -> "Add to Playlist" -> create a new playlist called "Liked Songs Copy"

## How to Use

Download software package from GitHub

Go to https://developer.spotify.com/

Sign in using your Spotify account

Click the "See it in action" button or scroll down

Copy the value after ```const token =``` on line 2 (with quotations)

Create a text file called .env in the project directory, then open this file in notepad

Create a variable called token like so:  
```TOKEN=```  

Now paste the copied token value directly after the "=". NOTE: This token is only valid for 1 hour, you will have to grab this token again after an hour.  

Open the project directory in terminal

Run the following command to install dependencies:  
```npm i```

Run the following command with the applicable subcommand to run the script:  
```node script.js all``` - (To gather all songs from all playlists)  
```node script.js liked``` - (To gather all liked songs from copy playlist "Liked Songs Copy")

Check the project directory for a CSV file containing your collected song info, it should be called "liked-songs.csv" when gathering "Liked Songs Copy" and "playlist-songs.csv" when gathering all songs from all playlists.