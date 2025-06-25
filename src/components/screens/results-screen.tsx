"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SongCard } from "@/components/song-card";
import { RefreshCw, Sparkles } from 'lucide-react';

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

export const ResultsScreen = ({ mood, songs, onReset }: { mood: string; songs: string[]; onReset: () => void; }) => {
  return (
    <Card className="shadow-2xl animate-in fade-in zoom-in-95 duration-500 w-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl sm:text-3xl flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary"/>
            Your Vibe is: {mood}
        </CardTitle>
        <CardDescription className="text-center pt-2">Here are some tracks we think you'll like. Connect to Spotify to listen.</CardDescription>
        <div className="pt-4 flex justify-center">
            <Button>
                <SpotifyIcon className="w-5 h-5 mr-2" />
                Connect to Spotify
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 sm:h-72 pr-4">
            <div className="space-y-2">
                {songs.map((song, index) => (
                    <SongCard key={index} songTitle={song} />
                ))}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button onClick={onReset} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};
