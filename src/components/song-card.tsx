
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
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
      <title>WhatsApp</title>
      <path d="M12.04 2.176a10.15 10.15 0 0 0-7.38 3.122 10.203 10.203 0 0 0-2.9 8.32 10.253 10.253 0 0 0 1.95 5.34L2 22.001l3.35-1.758a10.122 10.122 0 0 0 4.98 1.252h.01a10.15 10.15 0 0 0 7.38-3.123 10.205 10.205 0 0 0 2.901-8.32 10.25 10.25 0 0 0-1.95-5.34l-1.68-2.838-2.84-1.682zm4.18 11.278c-.24-.12-.83-.41-1.02-.46a.78.78 0 0 0-.71.46 2.09 2.09 0 0 1-1.89 1.25c-.24 0-.46-.01-.65-.02a4.41 4.41 0 0 1-2.9-1.25 5.56 5.56 0 0 1-1.95-3.37c-.12-.24-.03-.45.09-.58a.51.51 0 0 1 .36-.18c.12 0 .24-.01.35 0a.48.48 0 0 1 .42.21c.14.26.47.82.52.88.05.06.09.12.01.24-.08.12-.13.18-.24.3a.24.24 0 0 0-.06.18c.02.11.11.23.23.36.27.28.98.92 2.11 1.8.84.65 1.25.83 1.41.88.16.05.28.04.38-.03a1.4 1.4 0 0 0 .58-.79c.08-.13.04-.24-.02-.33a11.96 11.96 0 0 0-.6-1.02c-.11-.18-.23-.3-.3-.42-.06-.12.01-.24.06-.3.05-.06.11-.08.18-.08.06 0 .12 0 .18-.01.21.01.39.11.53.27.14.16.21.36.21.58-.01.76-.36 1.42-.42 1.52z"/>
    </svg>
);
  
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
      <title>Facebook</title>
      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24H12.82v-9.29H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.92c-1.5 0-1.793.715-1.793 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.732 0 1.325-.593 1.325-.1.325V1.325C24 .593 23.407 0 22.675 0z"/>
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
      <title>Instagram</title>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.784.297-1.45.717-2.126 1.393C1.33 2.7.91 3.366.63 4.14.333 4.905.132 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.26 2.148.558 2.913.297.783.717 1.45 1.393 2.126.677.678 1.344 1.097 2.126 1.393s1.636.225 2.913.285c1.28.058 1.687.072 4.947.072s3.667-.015 4.947-.072c1.277-.06 2.148-.26 2.913-.558.783-.297 1.45-.717 2.126-1.393.678-.677 1.097-1.344 1.393-2.126.297-.765.498-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.26-2.148-.558-2.913-.297-.784-.717-1.45-1.393-2.126C21.314 1.33 20.647.91 19.868.63c-.765-.297-1.636-.498-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.07 1.17.05 1.805.248 2.227.415.562.217.96.477 1.382.896.419.42.679.82.896 1.383.167.422.365 1.057.413 2.227.056 1.265.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.05 1.17-.248 1.805-.416 2.227a3.48 3.48 0 0 1-.896 1.382c-.42.419-.82.679-1.383.896-.422.167-1.057.365-2.227.413-1.265.056-1.646.07-4.85.07s-3.585-.015-4.85-.07c-1.17-.05-1.805-.248-2.227-.416a3.49 3.49 0 0 1-1.382-.896c-.42-.419-.679-.82-.896-1.383-.167-.422-.365-1.057-.413-2.227-.056-1.265-.07-1.646-.07-4.85s.015-3.585.07-4.85c.05-1.17.248 1.805.415-2.227.218-.563.477-.96.896-1.382.42-.419.82-.679 1.383-.896.422-.167 1.057.365 2.227-.413C8.415 2.176 8.797 2.16 12 2.16zm0 3.24c-2.973 0-5.4 2.427-5.4 5.4s2.427 5.4 5.4 5.4 5.4-2.427 5.4-5.4-2.427-5.4-5.4-5.4zm0 8.718c-1.833 0-3.318-1.485-3.318-3.318s1.485-3.318 3.318-3.318 3.318 1.485 3.318 3.318-1.485 3.318-3.318 3.318zm5.232-7.85c-.596 0-1.08.484-1.08 1.08s.484 1.08 1.08 1.08c.596 0 1.08-.484 1.08-1.08s-.484-1.08-1.08-1.08z"/>
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
    if (typeof window !== 'undefined' && navigator.share) {
        const dummyFile = new File([""], "dummy.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [dummyFile] })) {
            setCanShareNatively(true);
        }
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
                <Button onClick={handleShare} disabled={isSharing || !canShareNatively} className="w-full" title={!canShareNatively ? "Your browser doesn't support direct sharing." : "Share"}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {isSharing ? 'Sharing...' : 'Share via...'}
                </Button>
                
                <Button onClick={handleDownload} disabled={isSharing} className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {isSharing ? 'Generating...' : 'Download Image'}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground pt-2">
                    <p>Download the image to share on your favorite apps:</p>
                </div>

                <div className="flex justify-center items-center gap-4 pt-1">
                    <WhatsAppIcon className="w-5 h-5 text-muted-foreground" title="WhatsApp" />
                    <FacebookIcon className="w-5 h-5 text-muted-foreground" title="Facebook" />
                    <InstagramIcon className="w-5 h-5 text-muted-foreground" title="Instagram" />
                </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

    
