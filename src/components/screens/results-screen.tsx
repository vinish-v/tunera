
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SongCard, SongCardSkeleton } from "@/components/song-card";
import { RefreshCw, Sparkles, Languages, Play, Share2 } from 'lucide-react';
import { useState, useRef, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MoodCardShare } from "@/components/mood-card-share";
import { toBlob, toPng } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";

type Song = { title: string; artist: string };

const languages = ['Arabic', 'Bengali', 'Dutch', 'English', 'French', 'German', 'Gujarati', 'Hindi', 'Indonesian', 'Italian', 'Japanese', 'Kannada', 'Korean', 'Malayalam', 'Mandarin', 'Marathi', 'Odia', 'Polish', 'Portuguese', 'Punjabi', 'Russian', 'Spanish', 'Tamil', 'Telugu', 'Thai', 'Turkish', 'Urdu', 'Vietnamese'];
const platforms = ['YouTube', 'Spotify', 'YouTube Music', 'Amazon Music'];

export const ResultsScreen = ({ mood, songs, onReset, onRefresh, isRefreshing, language, onLanguageChange, refreshKey, selfie, emoji }: { mood: string; songs: Song[]; onReset: () => void; onRefresh: () => void; isRefreshing: boolean; language: string; onLanguageChange: (language: string) => void; refreshKey: number; selfie: string; emoji: string; }) => {
  const [streamingPlatform, setStreamingPlatform] = useState('YouTube');
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (navigator.share) {
        setCanShare(true);
    }
  }, []);

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
        const blob = await toBlob(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        if (!blob) {
            toast({ variant: "destructive", title: "Failed to generate image."});
            return;
        };

        const file = new File([blob], 'camood-vibe.png', { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'My Camood Vibe',
                text: `Check out my vibe! I'm feeling ${mood} and listening to ${songs[0]?.title || 'some great music'}.`,
                files: [file],
            });
        } else {
             handleDownload();
             toast({ title: "Sharing not supported", description: "Your image has been downloaded instead." });
        }
    } catch (error) {
        console.error('Sharing failed', error);
        toast({ variant: "destructive", title: "Sharing failed", description: "Could not share your vibe. Please try downloading."});
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = 'camood-vibe.png';
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Download failed', error);
        toast({ variant: "destructive", title: "Download failed", description: "Could not download your vibe card."});
    }
  };
  
  return (
    <Card className="shadow-2xl animate-in fade-in zoom-in-95 duration-500 w-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl sm:text-3xl flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary"/>
            Your Vibe is: <span className="capitalize">{mood}</span>
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
      <CardFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-6">
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
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full" disabled={!selfie || !emoji || songs.length === 0}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Vibe
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Your Vibe</DialogTitle>
                    <DialogDescription>
                        Here's your mood card. Share it with your friends!
                    </DialogDescription>
                </DialogHeader>
                <MoodCardShare
                    ref={cardRef}
                    selfieDataUri={selfie}
                    emoji={emoji}
                    mood={mood}
                    song={songs[0]}
                />
                <DialogFooter className="sm:justify-end gap-2">
                    { canShare && <Button onClick={handleShare}>Share</Button> }
                    <Button onClick={handleDownload} variant="outline">Download</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
