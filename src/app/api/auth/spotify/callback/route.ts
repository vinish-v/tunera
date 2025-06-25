import { NextRequest, NextResponse } from 'next/server';
import spotifyApi from '@/lib/spotify';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    // Redirect to home with error
    const url = new URL('/', req.url);
    url.searchParams.set('error', 'SpotifyLoginFailed');
    return NextResponse.redirect(url);
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    const response = NextResponse.redirect(new URL('/', req.url));

    response.cookies.set('spotify_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      path: '/',
      sameSite: 'lax',
    });

    response.cookies.set('spotify_refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Spotify auth callback error', error);
    const url = new URL('/', req.url);
    url.searchParams.set('error', 'SpotifyLoginFailed');
    return NextResponse.redirect(url);
  }
}
