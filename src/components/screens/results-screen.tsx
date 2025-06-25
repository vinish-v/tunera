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
} from "@/components/ui/select";

type Song = { title: string; artist: string };
type ResultsScreenProps = {
    moodResult: { mood: string, emoji: string };
    selfieDataUri: string;
    songs: Song[];
    onReset: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    language: string;
    onLanguageChange: (language: string) => void;
    refreshKey: number;
}


const languages = ['Arabic', 'Bengali', 'Dutch', 'English', 'French', 'German', 'Gujarati', 'Hindi', 'Indonesian', 'Italian', 'Japanese', 'Kannada', 'Korean', 'Malayalam', 'Mandarin', 'Marathi', 'Odia', 'Polish', 'Portuguese', 'Punjabi', 'Russian', 'Spanish', 'Tamil', 'Telugu', 'Thai', 'Turkish', 'Urdu', 'Vietnamese'];
const platforms = ['YouTube', 'Spotify', 'YouTube Music', 'Amazon Music'];

export const ResultsScreen = ({ moodResult, selfieDataUri, songs, onReset, onRefresh, isRefreshing, language, onLanguageChange, refreshKey }: ResultsScreenProps) => {
  const [streamingPlatform, setStreamingPlatform] = useState('YouTube');
  
  return (
    <Card className="shadow-2xl animate-in fade-in zoom-in-95 duration-500 w-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl sm:text-3xl flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary"/>
            Your Vibe is: <span className="capitalize">{moodResult.mood}</span>
        </CardTitle>
        <CardDescription className="text-center pt-2">
            Here are some tracks we think you'll like. Click a song to listen on your selected platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-2 gap-2 mb-4">
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
        <ScrollArea className="h-72 sm:h-96 pr-4">
            <div className="space-y-2">
              {isRefreshing ? (
                Array.from({ length: 8 }).map((_, index) => <SongCardSkeleton key={index} />)
              ) : (
                songs.map((song, index) => (
                    <SongCard 
                        key={`${refreshKey}-${song.title}-${song.artist}-${index}`} 
                        song={song} 
                        streamingPlatform={streamingPlatform}
                        selfieDataUri={selfieDataUri}
                        moodResult={moodResult}
                    />
                ))
              )}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-6">
        <div className="grid grid-cols-2 gap-2 w-full">
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
        </div>
      </CardFooter>
    </Card>
  );
};
