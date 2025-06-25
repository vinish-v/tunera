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
    const data = await spotifyApi.searchTracks(`track:${query} artist:${artist}`, { limit: 1 });
    if (data.body.tracks && data.body.tracks.items.length > 0) {
      return NextResponse.json(data.body.tracks.items[0]);
    } else {
      // Fallback search without artist if no results
      const fallbackData = await spotifyApi.searchTracks(`track:${query}`, { limit: 1 });
      if (fallbackData.body.tracks && fallbackData.body.tracks.items.length > 0) {
        return NextResponse.json(fallbackData.body.tracks.items[0]);
      }
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Spotify search error', error);
    // This could be a 401 if token expired. A real app would handle token refresh here.
    if ((error as any).statusCode === 401) {
        return NextResponse.json({ error: 'Spotify token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to search on Spotify' }, { status: 500 });
  }
}
