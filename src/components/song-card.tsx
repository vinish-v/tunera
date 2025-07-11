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
import { toBlob } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";
import { getTrackInfo } from '@/app/actions';

type Song = { title: string; artist: string };
type MoodResult = { mood: string; emoji: string };

type SongCardProps = {
  song: Song;
  streamingPlatform: string;
  selfieDataUri?: string;
  moodResult?: MoodResult;
}

type TrackInfo = {
    name: string;
    artist: string;
    title:string;
    albumImageUrl: string | null;
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

export function SongCard({ song, streamingPlatform, selfieDataUri, moodResult }: SongCardProps) {
  const { addFavourite, removeFavourite, isFavourite, isLoaded } = useFavourites();
  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'downloading'>('idle');
  const moodCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [canShare, setCanShare] = useState(false);
  
  const songId = `${song.title}-${song.artist}`;
  const isFav = isLoaded && isFavourite(songId);

  useEffect(() => {
    const fetchTrack = async () => {
      setIsLoading(true);
      try {
        const trackInfo = await getTrackInfo(song);
        setTrack(trackInfo);
      } catch (error) {
        console.error('Failed to fetch track info:', error);
        setTrack({ ...song, albumImageUrl: null });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrack();
  }, [song]);
  
  useEffect(() => {
    if (isShareOpen) {
      const checkSharing = async () => {
        if (navigator.share && navigator.canShare) {
          const dummyFile = new File([new Blob()], "test.png", { type: "image/png" });
          if (navigator.canShare({ files: [dummyFile] })) {
            setCanShare(true);
            return;
          }
        }
        setCanShare(false);
      };
      checkSharing();
    }
  }, [isShareOpen]);

  const handleDownload = useCallback(async () => {
    if (!moodCardRef.current) return;
    setShareState('downloading');
    try {
        const blob = await toBlob(moodCardRef.current, { quality: 0.95, pixelRatio: 2 });
        if (!blob) throw new Error("Could not create image blob.");

        const link = document.createElement('a');
        link.download = `tunera-vibe-${song.title}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Download failed', error);
        toast({
            title: 'Download failed',
            description: 'Could not generate image for download.',
            variant: 'destructive'
        });
    } finally {
        setShareState('idle');
    }
  }, [song.title, toast]);
  
  const handleShare = useCallback(async () => {
    if (!moodCardRef.current || !canShare) return;

    setShareState('sharing');
    try {
        const blob = await toBlob(moodCardRef.current, { quality: 0.95, pixelRatio: 2 });
        if (!blob) {
            throw new Error('Failed to create image blob.');
        }

        const file = new File([blob], `tunera-vibe-${song.title}.png`, { type: 'image/png' });

        await navigator.share({
            files: [file],
            title: 'My Tunera Vibe',
            text: `Feeling ${moodResult?.mood || 'great'}! Check out the vibe I just captured with Tunera.`,
        });
    } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
            console.error('Sharing failed', error);
            toast({
                title: 'Sharing Failed',
                description: 'Could not share the image. Please try downloading it instead.',
                variant: 'destructive',
            });
        }
    } finally {
        setShareState('idle');
    }
  }, [song.title, toast, moodResult?.mood, canShare]);

  const handleClick = useCallback(() => {
    if (canShare) {
        handleShare();
    } else {
        handleDownload();
    }
  }, [canShare, handleShare, handleDownload]);

  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
        removeFavourite(songId);
    } else {
        addFavourite(song);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  const handleCardClick = () => {
    const query = encodeURIComponent(`${song.title} ${song.artist}`);
    let url: string | undefined;

    switch (streamingPlatform) {
        case 'Spotify':
            url = `https://open.spotify.com/search/${query}`;
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

  if (isLoading) {
    return <SongCardSkeleton />;
  }

  return (
    <>
      <Card 
        onClick={handleCardClick}
        className="bg-background/50 group hover:bg-accent/50 hover:shadow-md transition-all duration-300 cursor-pointer"
      >
        <CardContent className="p-3 flex items-center gap-3">
            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                {track?.albumImageUrl ? (
                    <Image
                        src={track.albumImageUrl}
                        alt={`Album art for ${song.title}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                    />
                ) : (
                    <Music className="w-8 h-8 text-muted-foreground" />
                )}
            </div>
            <div className="flex-grow overflow-hidden min-w-0">
              <p className="font-bold truncate" title={song.title}>{song.title}</p>
              <p className="text-sm text-muted-foreground truncate" title={song.artist}>{song.artist}</p>
            </div>
            <div className="flex items-center shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9"
                    onClick={handleFavouriteClick}
                    title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                    disabled={!isLoaded}
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
          <DialogContent className="max-h-[90svh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="sr-only">Share Your Vibe</DialogTitle>
                <DialogDescription className="sr-only">Share this mood card with your friends.</DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-y-auto">
              <MoodCardShare
                  ref={moodCardRef}
                  selfieDataUri={selfieDataUri}
                  mood={moodResult.mood}
                  emoji={moodResult.emoji}
                  song={{title: song.title, artist: song.artist}}
                  imageUrl={track?.albumImageUrl ?? undefined}
              />
            </div>
            <DialogFooter className="mt-auto pt-4 flex-col sm:flex-col sm:justify-center gap-2">
                <Button 
                    onClick={handleClick} 
                    disabled={shareState !== 'idle'} 
                    className="w-full"
                >
                    {(canShare) ? <Share2 className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                    
                    {shareState === 'idle' && (canShare ? 'Share' : 'Download to Share')}
                    {shareState === 'sharing' && 'Sharing...'}
                    {shareState === 'downloading' && 'Downloading...'}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
