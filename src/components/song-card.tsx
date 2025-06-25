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
  const [isSharing, setIsSharing] = useState(false);
  const moodCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = useCallback(async () => {
    if (!moodCardRef.current) return;
    setIsSharing(true);
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
        setIsSharing(false);
    }
  }, [song.title, toast]);

  const handleShare = useCallback(async () => {
    if (!moodCardRef.current) return;
    setIsSharing(true);
    try {
        const blob = await toBlob(moodCardRef.current, { quality: 0.95, pixelRatio: 2 });
        if (!blob) {
            throw new Error('Failed to create image blob.');
        }

        const file = new File([blob], `camood-vibe-${song.title}.png`, { type: 'image/png' });

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
  }, [song.title, toast, handleDownload]);

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

  const songTitle = track?.name ?? song.title;
  const artistName = track?.artists.map(a => a.name).join(', ') ?? song.artist;
  const imageUrl = track?.album.images[0]?.url;

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

  if (isLoading) {
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
                className="rounded-md"
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
            {isLoaded && track && (
              <div className="flex items-center shrink-0">
                  <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-9 w-9"
                      onClick={handleFavouriteClick}
                      title="Add to Favourites"
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
            )}
        </CardContent>
      </Card>
      
      {selfieDataUri && moodResult && (
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
                  song={song}
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
      )}
    </>
  );
}
