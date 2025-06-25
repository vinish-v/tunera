import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
      <title>Spotify icon</title>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.923 17.54c-.18.298-.56.39-.855.21l-4.78-2.924a.561.561 0 0 1-.21-.854c.18-.298.56-.39.854-.21l4.78 2.924c.298.18.39.558.21.854zm1.25-2.22c-.225.372-.69.495-1.06.27l-5.487-3.35a.692.692 0 0 1-.27-1.062c.224-.372.69-.494 1.06-.27l5.487 3.35c.37.224.495.69.27 1.062zm.23-2.583c-.27.444-.852.59-1.296.32l-6.42-3.923c-.444-.27-.59-.852-.32-1.296.27-.444.852-.59 1.296-.32l6.42 3.923c.444.27.59.852.32 1.296z" />
    </svg>
);

export default function AccountPage() {
    const cookieStore = cookies();
    const isSpotifyConnected = cookieStore.has('spotify_access_token');

    return (
        <main className="flex flex-1 flex-col items-center p-4 sm:p-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your connected services to enhance your experience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between rounded-lg p-4 transition-colors">
                        <div className="flex items-center gap-4">
                            <SpotifyIcon className="w-8 h-8 text-[#1ED760]" />
                            <div>
                                <h3 className="font-semibold text-lg">Spotify</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isSpotifyConnected ? "Connected" : "Not Connected"}
                                </p>
                            </div>
                        </div>
                        {isSpotifyConnected ? (
                            <Button variant="outline" asChild>
                                <a href="/api/auth/spotify/logout">Disconnect</a>
                            </Button>
                        ) : (
                            <Button asChild>
                                <a href="/api/auth/spotify/login">Connect</a>
                            </Button>
                        )}
                    </div>
                    <Separator />
                </CardContent>
            </Card>
        </main>
    );
}
