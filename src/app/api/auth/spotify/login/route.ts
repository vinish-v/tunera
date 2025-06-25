import { NextResponse } from 'next/server';
import spotifyApi from '@/lib/spotify';

const scopes = [
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'streaming',
  'user-read-private',
];

export async function GET() {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state-goes-here');
  return NextResponse.redirect(authorizeURL);
}
