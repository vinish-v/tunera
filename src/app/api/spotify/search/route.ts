import { NextRequest, NextResponse } from 'next/server';
import spotifyApi from '@/lib/spotify';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const accessToken = cookies().get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  spotifyApi.setAccessToken(accessToken);

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
    // This could be a 401 if token expired. A real app would handle token refresh here.
    if ((error as any).statusCode === 401) {
        return NextResponse.json({ error: 'Spotify token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to search on Spotify' }, { status: 500 });
  }
}
