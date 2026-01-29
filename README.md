# Spotify Playlist Puller

## 1.0 Release Notice
Version 1.0 of the Spotify Playlist Puller is fully operational and is currently made to copy the artist, song title, and album title from every song in a playlist copy of liked songs specifically titled "Liked Songs Copy". Future releases will contain the potential to gather all songs from all playlists. See the following sections below for getting started and using the tool!

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

In the desktop client for Spotify, go to your liked songs.  

Ctrl + A -> right click -> "Add to Playlist" -> create a new playlist called "Liked Songs Copy"

## How to Use

Download software package from GitHub

Go to https://developer.spotify.com/

Sign in using your Spotify account

Click the "See it in action" button or scroll down

Copy the value after ```const token =``` on line 2 (with quotations)

Create a text file called .env in the project directory, then open this file in notepad.

Create a variable called token like so:  
```TOKEN=```  

And paste the token value after this  

Open the project directory in terminal

Run the following command to install dependencies:  
```npm i```

Run the following command to run the script:  
```node script.js```

Check the project directory for a CSV file containing your collected song info, it should be called "liked-songs.csv"