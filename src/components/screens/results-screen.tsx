
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SongCard, SongCardSkeleton } from "@/components/song-card";
import { RefreshCw, Sparkles, Languages } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

type Song = { title: string; artist: string };

const languages = ['Arabic', 'Bengali', 'Dutch', 'English', 'French', 'German', 'Gujarati', 'Hindi', 'Indonesian', 'Italian', 'Japanese', 'Kannada', 'Korean', 'Malayalam', 'Mandarin', 'Marathi', 'Odia', 'Polish', 'Portuguese', 'Punjabi', 'Russian', 'Spanish', 'Tamil', 'Telugu', 'Thai', 'Turkish', 'Urdu', 'Vietnamese'];

export const ResultsScreen = ({ mood, songs, onReset, isSpotifyConnected, onRefresh, isRefreshing, language, onLanguageChange }: { mood: string; songs: Song[]; onReset: () => void; isSpotifyConnected: boolean; onRefresh: () => void; isRefreshing: boolean; language: string; onLanguageChange: (language: string) => void; }) => {
  return (
    <Card className="shadow-2xl animate-in fade-in zoom-in-95 duration-500 w-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl sm:text-3xl flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary"/>
            Your Vibe is: {mood}
        </CardTitle>
        <CardDescription className="text-center pt-2">
            {isSpotifyConnected
              ? "Here are some tracks we think you'll like."
              : "Connect to Spotify to see album art and listen."}
        </CardDescription>
        <div className="pt-4 flex justify-center">
            {!isSpotifyConnected ? (
              <Button asChild>
                <a href="/api/auth/spotify/login" target="_blank" rel="noopener noreferrer">
                  <SpotifyIcon className="w-5 h-5 mr-2" />
                  Connect to Spotify
                </a>
              </Button>
            ) : (
                <div className='flex flex-col items-center gap-2'>
                    <p className='text-sm text-green-400 font-semibold flex items-center gap-2'>
                        <SpotifyIcon className="w-5 h-5"/>
                        Connected to Spotify
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <a href="/api/auth/spotify/logout">Disconnect</a>
                    </Button>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4 px-1">
            <Languages className="w-5 h-5 text-muted-foreground" />
            <Select onValueChange={onLanguageChange} defaultValue={language}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <ScrollArea className="h-96 pr-4">
            <div className="space-y-2">
              {isRefreshing ? (
                Array.from({ length: 8 }).map((_, index) => <SongCardSkeleton key={index} />)
              ) : (
                songs.map((song, index) => (
                    <SongCard key={`${song.title}-${song.artist}-${index}`} song={song} isSpotifyConnected={isSpotifyConnected} />
                ))
              )}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6">
        <Button onClick={onReset} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
        </Button>
        <Button onClick={onRefresh} disabled={isRefreshing} className="w-full">
          {isRefreshing ? (
              <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
              </>
          ) : (
              <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get New Songs
              </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
