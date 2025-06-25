
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SongCard, SongCardSkeleton } from "@/components/song-card";
import { RefreshCw, Sparkles, Languages, Play } from 'lucide-react';
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Song = { title: string; artist: string };

const languages = ['Arabic', 'Bengali', 'Dutch', 'English', 'French', 'German', 'Gujarati', 'Hindi', 'Indonesian', 'Italian', 'Japanese', 'Kannada', 'Korean', 'Malayalam', 'Mandarin', 'Marathi', 'Odia', 'Polish', 'Portuguese', 'Punjabi', 'Russian', 'Spanish', 'Tamil', 'Telugu', 'Thai', 'Turkish', 'Urdu', 'Vietnamese'];
const platforms = ['Spotify', 'YouTube', 'YouTube Music', 'Amazon Music'];

export const ResultsScreen = ({ mood, songs, onReset, onRefresh, isRefreshing, language, onLanguageChange, refreshKey }: { mood: string; songs: Song[]; onReset: () => void; onRefresh: () => void; isRefreshing: boolean; language: string; onLanguageChange: (language: string) => void; refreshKey: number; }) => {
  const [streamingPlatform, setStreamingPlatform] = useState('Spotify');
  
  return (
    <Card className="shadow-2xl animate-in fade-in zoom-in-95 duration-500 w-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl sm:text-3xl flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary"/>
            Your Vibe is: {mood}
        </CardTitle>
        <CardDescription className="text-center pt-2">
            Here are some tracks we think you'll like. Click a song to listen on your selected platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4 mb-4 px-1">
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-muted-foreground" />
                <Select onValueChange={setStreamingPlatform} defaultValue={streamingPlatform}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                        {platforms.map(platform => (
                            <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <ScrollArea className="h-96 pr-4">
            <div className="space-y-2">
              {isRefreshing ? (
                Array.from({ length: 8 }).map((_, index) => <SongCardSkeleton key={index} />)
              ) : (
                songs.map((song, index) => (
                    <SongCard key={`${refreshKey}-${song.title}-${song.artist}-${index}`} song={song} streamingPlatform={streamingPlatform} />
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
