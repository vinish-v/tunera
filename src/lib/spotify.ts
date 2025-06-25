import SpotifyWebApi from 'spotify-web-api-node';

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("Missing Spotify credentials in .env file");
}

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/spotify/callback`,
});

export default spotifyApi;
