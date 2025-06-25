import CamoodApp from '@/components/camood-app';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = cookies();
  const isSpotifyConnected = cookieStore.has('spotify_access_token');

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
      <CamoodApp isSpotifyConnected={isSpotifyConnected} />
    </main>
  );
}
