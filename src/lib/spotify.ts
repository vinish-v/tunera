'use server';

// Simple in-memory cache for the access token
let accessToken: {
    token: string;
    expiresAt: number;
} | null = null;

async function getAccessToken() {
    if (accessToken && Date.now() < accessToken.expiresAt) {
        return accessToken.token;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("Spotify client ID or secret not set in .env file");
        return null;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store'
    });

    if (!response.ok) {
        console.error('Failed to get Spotify access token', await response.text());
        return null;
    }

    const data = await response.json();
    const expiresIn = data.expires_in * 1000; // convert to milliseconds
    accessToken = {
        token: data.access_token,
        expiresAt: Date.now() + expiresIn,
    };

    return accessToken.token;
}

export async function searchTrack(query: string): Promise<{ name: string; artist: string; albumImageUrl: string | null } | null> {
    const token = await getAccessToken();
    if (!token) {
        return null;
    }

    const searchParams = new URLSearchParams({
        q: query,
        type: 'track',
        limit: '1',
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error('Failed to fetch track from spotify, status:', response.status);
        return null;
    }

    const data = await response.json();
    const track = data.tracks?.items[0];

    if (!track) {
        return null;
    }
    
    return {
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        albumImageUrl: track.album?.images[0]?.url || null,
    };
}
