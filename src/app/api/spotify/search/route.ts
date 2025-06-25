import { NextRequest, NextResponse } from 'next/server';
import spotifyApi from '@/lib/spotify';
import { cookies } from 'next/headers';

// In-memory cache for the application's access token
let appAccessToken: {
  token: string | null;
  expiresAt: number | null;
} = {
  token: null,
  expiresAt: null,
};

async function getAppAccessToken() {
  if (appAccessToken.token && appAccessToken.expiresAt && Date.now() < appAccessToken.expiresAt) {
    return appAccessToken.token;
  }

  try {
    const data = await spotifyApi.clientCredentialsGrant();
    appAccessToken = {
      token: data.body['access_token'],
      // Set expiry to be 1 minute before actual expiry to be safe
      expiresAt: Date.now() + (data.body['expires_in'] * 1000) - 60000,
    };
    return appAccessToken.token;
  } catch (error) {
    console.error('Spotify client credentials grant error', error);
    appAccessToken.token = null; // Reset token on error
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userAccessToken = cookies().get('spotify_access_token')?.value;
  let activeToken = userAccessToken;

  if (!activeToken) {
    activeToken = await getAppAccessToken();
  }

  if (!activeToken) {
    return NextResponse.json({ error: 'Could not authenticate with Spotify' }, { status: 401 });
  }

  spotifyApi.setAccessToken(activeToken);

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const artist = searchParams.get('artist');

  if (!query || !artist) {
    return NextResponse.json({ error: 'Query and artist parameters are required' }, { status: 400 });
  }

  try {
    // Attempt a precise search first
    const preciseQuery = `track:${query} artist:${artist}`;
    let data = await spotifyApi.searchTracks(preciseQuery, { limit: 1 });
    
    if (data.body.tracks && data.body.tracks.items.length > 0) {
      return NextResponse.json(data.body.tracks.items[0]);
    }

    // Fallback to a more general search if the precise one fails
    data = await spotifyApi.searchTracks(`${query} ${artist}`, { limit: 1 });
    if (data.body.tracks && data.body.tracks.items.length > 0) {
      return NextResponse.json(data.body.tracks.items[0]);
    }

    // Final fallback to just the track name
    data = await spotifyApi.searchTracks(query, { limit: 1 });
    if (data.body.tracks && data.body.tracks.items.length > 0) {
        return NextResponse.json(data.body.tracks.items[0]);
    }
    
    return NextResponse.json({ error: 'Track not found' }, { status: 404 });

  } catch (error) {
    console.error('Spotify search error', error);
    if ((error as any).statusCode === 401) {
        // Token is invalid. If it was an app token, it will be refreshed on the next request.
        // If it was a user token, they need to re-authenticate.
        return NextResponse.json({ error: 'Spotify token expired or invalid' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to search on Spotify' }, { status: 500 });
  }
}
