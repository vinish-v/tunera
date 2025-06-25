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

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>WhatsApp</title>
      <path d="M12.04 2.176a10.15 10.15 0 0 0-7.38 3.122 10.203 10.203 0 0 0-2.9 8.32 10.253 10.253 0 0 0 1.95 5.34L2 22.001l3.35-1.758a10.122 10.122 0 0 0 4.98 1.252h.01a10.15 10.15 0 0 0 7.38-3.123 10.205 10.205 0 0 0 2.901-8.32 10.25 10.25 0 0 0-1.95-5.34l-1.68-2.838-2.84-1.682zm4.18 11.278c-.24-.12-.83-.41-1.02-.46a.78.78 0 0 0-.71.46 2.09 2.09 0 0 1-1.89 1.25c-.24 0-.46-.01-.65-.02a4.41 4.41 0 0 1-2.9-1.25 5.56 5.56 0 0 1-1.95-3.37c-.12-.24-.03-.45.09-.58a.51.51 0 0 1 .36-.18c.12 0 .24-.01.35 0a.48.48 0 0 1 .42.21c.14.26.47.82.52.88.05.06.09.12.01.24-.08.12-.13.18-.24.3a.24.24 0 0 0-.06.18c.02.11.11.23.23.36.27.28.98.92 2.11 1.8.84.65 1.25.83 1.41.88.16.05.28.04.38-.03a1.4 1.4 0 0 0 .58-.79c.08-.13.04-.24-.02-.33a11.96 11.96 0 0 0-.6-1.02c-.11-.18-.23-.3-.3-.42-.06-.12.01-.24.06-.3.05-.06.11-.08.18-.08.06 0 .12 0 .18-.01.21.01.39.11.53.27.14.16.21.36.21.58-.01.76-.36 1.42-.42 1.52z"/>
    </svg>
);
  
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Facebook</title>
      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24H12.82v-9.29H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.92c-1.5 0-1.793.715-1.793 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
    </svg>
);

export function SongCard({ song, streamingPlatform, initialTrack, selfieDataUri, moodResult }: SongCardProps) {
  const [track, setTrack] = useState<SpotifyApi.SingleTrackResponse | null>(initialTrack || null);
  const [isLoading, setIsLoading] = useState(!initialTrack);
  const { addFavourite, removeFavourite, isFavourite, isLoaded } = useFavourites();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [canShareNatively, setCanShareNatively] = useState(false);
  const moodCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This check needs to be in useEffect to ensure `navigator` is available.
    const dummyFile = new File([""], "dummy.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [dummyFile] })) {
        setCanShareNatively(true);
    }
  }, []);

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

        await navigator.share({
            files: [file],
            title: 'My Camood Vibe',
            text: 'Check out the vibe I just captured with Camood!',
        });

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
  }, [song.title, toast]);

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
              <DialogDescription>Here's a preview of your shareable mood card.</DialogDescription>
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
            <DialogFooter className="flex flex-col gap-2 pt-2">
                {canShareNatively ? (
                    <Button onClick={handleShare} disabled={isSharing} className="w-full">
                        <Share2 className="mr-2 h-4 w-4" />
                        {isSharing ? 'Sharing...' : 'Share via...'}
                    </Button>
                ) : (
                    <>
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Download the image to share it on other apps.</p>
                            <div className="flex justify-center items-center gap-2 mt-2">
                                <WhatsAppIcon className="w-5 h-5 fill-muted-foreground" />
                                <FacebookIcon className="w-5 h-5 fill-muted-foreground" />
                            </div>
                        </div>
                        <Button onClick={handleDownload} disabled={isSharing} className="w-full mt-2" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            {isSharing ? 'Generating...' : 'Download Image'}
                        </Button>
                    </>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
