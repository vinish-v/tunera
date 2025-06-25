"use client";

import Image from 'next/image';
import { Music, Heart, Share2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Skeleton } from './ui/skeleton';
import { useFavourites } from '@/hooks/use-favourites';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MoodCardShare } from "./mood-card-share";
import { toBlob, toPng } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";


type Song = { title: string; artist: string };
type MoodResult = { mood: string; emoji: string };

type SongCardProps = {
  song: Song;
  streamingPlatform: string;
  initialTrack?: SpotifyApi.SingleTrackResponse | null;
  selfieDataUri?: string;
  moodResult?: MoodResult;
}

export const SongCardSkeleton = () => (
    <Card>
        <CardContent className="p-3 flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </CardContent>
    </Card>
);

export function SongCard({ song, streamingPlatform, initialTrack, selfieDataUri, moodResult }: SongCardProps) {
  const [track, setTrack] = useState<SpotifyApi.SingleTrackResponse | null>(initialTrack || null);
  const [isLoading, setIsLoading] = useState(!initialTrack);
  const { addFavourite, removeFavourite, isFavourite, isLoaded } = useFavourites();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'downloading'>('idle');
  const moodCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const songTitle = track?.name ?? song.title;
  const artistName = track?.artists.map(a => a.name).join(', ') ?? song.artist;
  const imageUrl = track?.album.images[0]?.url;

  const handleDownload = useCallback(async () => {
    if (!moodCardRef.current) return;
    setShareState('downloading');
    try {
        const dataUrl = await toPng(moodCardRef.current, { quality: 0.95, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `camood-vibe-${song.title}.png`;
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
        setShareState('idle');
        setIsShareOpen(false);
    }
  }, [song.title, toast]);
  
  const handleShare = useCallback(async () => {
    if (!moodCardRef.current) return;

    if (navigator.share) {
        setShareState('sharing');
        try {
            const blob = await toBlob(moodCardRef.current, { quality: 0.95, pixelRatio: 2 });
            if (!blob) {
                throw new Error('Failed to create image blob.');
            }

            const file = new File([blob], `camood-vibe-${song.title}.png`, { type: 'image/png' });

            await navigator.share({
                files: [file],
                title: 'My Camood Vibe',
                text: `Feeling ${moodResult?.mood || 'great'}! Check out the vibe I just captured with Camood.`,
            });
            setIsShareOpen(false); // Close dialog on successful share
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
                console.error('Sharing failed', error);
                toast({
                    title: 'Sharing not supported on this browser',
                    description: 'Your browser doesn\'t support direct sharing. Downloading the image instead.',
                });
                await handleDownload();
            }
        } finally {
            setShareState('idle');
        }
    } else {
        toast({
            title: "Sharing not supported",
            description: "Your browser doesn't support direct sharing. Downloading the image instead.",
        });
        await handleDownload();
    }
  }, [song.title, toast, moodResult?.mood, handleDownload]);

  useEffect(() => {
    if (initialTrack) {
        setTrack(initialTrack);
        setIsLoading(false);
        return;
    }

    const fetchTrack = async () => {
      setIsLoading(true);
      try {
        const searchQuery = new URLSearchParams({
            query: song.title,
            artist: song.artist
        });
        const response = await fetch(`/api/spotify/search?${searchQuery.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data && !data.error) {
            setTrack(data);
          } else {
            console.error('Failed to fetch track from spotify:', data.error);
            setTrack(null);
          }
        } else {
          console.error('Failed to fetch track from spotify, status:', response.status);
          setTrack(null);
        }
      } catch (error) {
        console.error('Error fetching track:', error);
        setTrack(null);
      }
      setIsLoading(false);
    };

    fetchTrack();
  }, [song, initialTrack]);

  const isFav = track ? isFavourite(track.id) : false;

  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track) return;

    if (isFav) {
        removeFavourite(track.id);
    } else {
        addFavourite(track);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  const handleClick = () => {
    const query = encodeURIComponent(`${song.title} ${song.artist}`);
    let url: string | undefined;

    switch (streamingPlatform) {
        case 'Spotify':
            url = track?.external_urls.spotify ?? `https://open.spotify.com/search/${query}`;
            break;
        case 'YouTube':
            url = `https://www.youtube.com/results?search_query=${query}`;
            break;
        case 'YouTube Music':
            url = `https://music.youtube.com/search?q=${query}`;
            break;
        case 'Amazon Music':
            url = `https://music.amazon.com/search/${query}`;
            break;
    }

    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading && !initialTrack) {
    return <SongCardSkeleton />;
  }

  return (
    <>
      <Card 
        onClick={handleClick}
        className="bg-background/50 group hover:bg-accent/50 hover:shadow-md transition-all duration-300 cursor-pointer"
      >
        <CardContent className="p-3 flex items-center gap-4">
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={`Album art for ${songTitle}`} 
                width={64} 
                height={64} 
                className="rounded-md object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                  <Music className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-grow overflow-hidden">
              <p className="font-bold truncate" title={songTitle}>{songTitle}</p>
              <p className="text-sm text-muted-foreground truncate" title={artistName}>{artistName}</p>
            </div>
            <div className="flex items-center shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9"
                    onClick={handleFavouriteClick}
                    title={track ? (isFav ? 'Remove from Favourites' : 'Add to Favourites') : "Cannot favourite track (Spotify API unavailable)"}
                    disabled={!track || !isLoaded}
                >
                    <Heart className={cn("h-5 w-5", isFav ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                    <span className="sr-only">Favourite</span>
                </Button>
                {selfieDataUri && moodResult && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9"
                    onClick={handleShareClick}
                    title="Share Vibe"
                  >
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">Share Vibe</span>
                  </Button>
                )}
            </div>
        </CardContent>
      </Card>
      
      {selfieDataUri && moodResult && (
        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Vibe</DialogTitle>
              <DialogDescription>Share this mood card with your friends.</DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-y-auto">
              <MoodCardShare
                  ref={moodCardRef}
                  selfieDataUri={selfieDataUri}
                  mood={moodResult.mood}
                  emoji={moodResult.emoji}
                  song={song}
                  imageUrl={imageUrl}
              />
            </div>
            <DialogFooter className="grid grid-cols-2 gap-2">
                <Button 
                    onClick={handleShare} 
                    disabled={shareState !== 'idle'} 
                    className="w-full"
                >
                    <Share2 className="mr-2 h-4 w-4" />
                    {shareState === 'sharing' ? 'Sharing...' : 'Share'}
                </Button>
                
                <Button 
                    onClick={handleDownload} 
                    disabled={shareState !== 'idle'} 
                    className="w-full" 
                    variant="outline"
                >
                    <Download className="mr-2 h-4 w-4" />
                    {shareState === 'downloading' ? 'Downloading...' : 'Download'}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
