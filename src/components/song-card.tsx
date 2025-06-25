
"use client";

import Image from 'next/image';
import { Music, Heart, Share2, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { useFavourites } from '@/hooks/use-favourites';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Song = { title: string; artist: string };

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

export function SongCard({ song, streamingPlatform, initialTrack }: { song: Song; streamingPlatform: string; initialTrack?: SpotifyApi.SingleTrackResponse | null }) {
  const [track, setTrack] = useState<SpotifyApi.SingleTrackResponse | null>(initialTrack || null);
  const [isLoading, setIsLoading] = useState(!initialTrack);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const { toast } = useToast();
  const { addFavourite, removeFavourite, isFavourite, isLoaded } = useFavourites();


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

  const generateShareUrl = () => {
    const query = encodeURIComponent(`${songTitle} ${artistName}`);
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
    return url;
  }

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateShareUrl();
    if (!url) {
        toast({
            title: "Could not generate link",
            description: "There was an issue generating a link for this song.",
            variant: "destructive"
        });
        return;
    }

    setShareUrl(url);

    if (navigator.share) {
        try {
            await navigator.share({
                title: `${songTitle} by ${artistName}`,
                text: `Check out this song I found with Camood!`,
                url: url,
            });
        } catch (error) {
            // If the user cancels the share, it's not an error, so we do nothing.
            if ((error as DOMException).name === 'AbortError') {
                return;
            }
            // For other errors (like "Permission Denied"), we fall back to the dialog.
            console.error('Web Share API failed, falling back to dialog:', error);
            setIsShareDialogOpen(true);
        }
    } else {
        // Fallback for browsers that don't support the Web Share API.
        setIsShareDialogOpen(true);
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
        title: "Link Copied!",
        description: "Song link copied to your clipboard.",
    });
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
  
  const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
      <title>WhatsApp</title>
      <path d="M12.04 2.176a10.03 10.03 0 0 0-7.093 2.94A10.023 10.023 0 0 0 2 12.063c0 2.433.87 4.704 2.45 6.49l-1.6 5.827 5.963-1.558a10.01 10.01 0 0 0 6.22 1.83h.003c5.526 0 10.003-4.475 10.003-10.002s-4.477-10-10.003-10.002zm0 1.623c5.03 0 9.11 3.69 9.11 8.243 0 4.553-4.08 8.24-9.11 8.24h-.002a8.553 8.553 0 0 1-4.88-1.558l-.35-.207-3.64 1.077.95-3.525.18-.33a8.53 8.53 0 0 1-2.02-5.32c0-4.552 4.08-8.242 9.11-8.242zm-3.32 4.413c-.1-.05-.28-.14-.41-.233-.13-.1-.23-.14-.33-.14s-.28.05-.41.234l-.41.48c-.1.14-.23.28-.33.32-.1.05-.23.05-.35 0-.13-.05-.56-.2-.93-.41-.3-.18-.58-.41-.78-.65-.2-.23-.4-.51-.43-.56s0-.14.04-.18c.03-.04.08-.08.13-.13.05-.05.08-.08.1-.1s.03-.1.03-.14c0-.05-.03-.1-.05-.13l-.23-.56s-.1-.23-.13-.23c-.04 0-.08 0-.1 0s-.15.03-.2.05c-.05.02-.13.05-.2.1-.07.05-.13.1-.18.15-.05.05-.1.1-.13.13-.03.04-.05.08-.07.1a.892.892 0 0 0-.15.33.91.91 0 0 0-.05.35c0 .13.03.25.08.38.05.12.1.25.15.35.05.1.1.2.16.3.06.1.13.2.2.3.15.24.3.48.5.7.2.2.4.38.6.53.2.15.4.28.6.4.2.1.38.18.58.23.2.05.38.08.53.08.15 0 .28-.02.4-.08.1-.03.25-.15.33-.28.07-.1.13-.25.18-.4.04-.15.04-.28.03-.4l-.03-.23c0-.04-.03-.08-.05-.12s-.05-.05-.1-.08c-.05-.03-.1-.05-.12-.05z"/>
    </svg>
  );

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
                      onClick={handleShareClick}
                      title="Share song"
                  >
                      <Share2 className="h-5 w-5 text-muted-foreground" />
                      <span className="sr-only">Share</span>
                  </Button>
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
              </div>
            )}
        </CardContent>
      </Card>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Share Song</DialogTitle>
                <DialogDescription>
                    Anyone with this link can listen. Direct sharing to Instagram from a website is not possible.
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                    <label htmlFor="link-input" className="sr-only">Link</label>
                    <Input id="link-input" value={shareUrl} readOnly />
                </div>
                <Button type="submit" size="sm" className="px-3" onClick={handleCopyLink}>
                    <span className="sr-only">Copy</span>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button asChild className="w-full">
                  <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out this song I found with Camood: ${songTitle} by ${artistName}\n${shareUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                      <WhatsAppIcon className="w-5 h-5 mr-2" />
                      Share to WhatsApp
                  </a>
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
