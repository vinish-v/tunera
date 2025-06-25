
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SongCard, SongCardSkeleton } from "@/components/song-card";
import { RefreshCw, Sparkles, Languages, Play, Share2, Download } from 'lucide-react';
import { useState, useRef, useCallback } from "react";
import { toBlob, toPng } from 'html-to-image';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MoodCardShare } from "../mood-card-share";
import { useToast } from "@/hooks/use-toast";


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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const moodCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleShare = useCallback(async () => {
    if (!moodCardRef.current) return;
    setIsSharing(true);
    try {
        const blob = await toBlob(moodCardRef.current, { quality: 0.95, pixelRatio: 2 });
        if (!blob) {
            throw new Error('Failed to create image blob.');
        }

        const file = new File([blob], 'camood-vibe.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'My Camood Vibe',
                text: 'Check out the vibe I just captured with Camood!',
            });
        } else {
            toast({
                title: "Can't share directly",
                description: "Your browser doesn't support direct file sharing. You can download the image instead.",
            });
            handleDownload();
        }
    } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
            console.error('Sharing failed', error);
            toast({
                title: 'Sharing failed',
                description: 'Something went wrong while trying to share.',
                variant: 'destructive',
            });
        }
    } finally {
        setIsSharing(false);
        setIsShareOpen(false);
    }
  }, [toast, handleDownload]);

  const handleDownload = useCallback(async () => {
      if (!moodCardRef.current) return;
      setIsSharing(true);
      try {
          const dataUrl = await toPng(moodCardRef.current, { quality: 0.95, pixelRatio: 2 });
          const link = document.createElement('a');
          link.download = 'camood-vibe.png';
          link.href = dataUrl;
          link.click();
      } catch (error) {
          console.error('Download failed', error);
          toast({
              title: 'Download failed',
              description: 'Could not generate image for download.',
              variant: 'destructive'
          });
      } finally {
          setIsSharing(false);
      }
  }, [toast]);
  
  return (
    <>
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
      <CardFooter className="flex flex-col gap-2 pt-6">
        <Button onClick={() => setIsShareOpen(true)} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share Vibe
        </Button>
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

    <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Vibe</DialogTitle>
          <DialogDescription>Here's a preview of your shareable mood card. Share it with your friends!</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <MoodCardShare
              ref={moodCardRef}
              selfieDataUri={selfieDataUri}
              mood={moodResult.mood}
              emoji={moodResult.emoji}
              song={songs[0]}
          />
        </div>
        <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button onClick={handleDownload} disabled={isSharing} className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {isSharing ? 'Generating...' : 'Download'}
            </Button>
            <Button onClick={handleShare} disabled={isSharing} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                {isSharing ? 'Sharing...' : 'Share'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};
