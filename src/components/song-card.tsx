
"use client";

import Image from 'next/image';
import { Music, Heart, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { useFavourites } from '@/hooks/use-favourites';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

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

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

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

    if (!url) {
        toast({
            title: "Could not generate link",
            description: "There was an issue generating a link for this song.",
            variant: "destructive"
        });
        return;
    }

    if (navigator.share) {
        try {
            await navigator.share({
                title: `${songTitle} by ${artistName}`,
                text: `Check out this song I found with Camood!`,
                url: url,
            });
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
                console.error('Error sharing', error);
                toast({
                    title: "Sharing failed",
                    description: "There was an issue sharing this song. The link has been copied instead.",
                    variant: "destructive"
                });
                await navigator.clipboard.writeText(url);
            }
        }
    } else {
        // Fallback for browsers that don't support navigator.share
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: "Link Copied!",
                description: "Song link copied to your clipboard.",
            });
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Could not copy the link to your clipboard.",
                variant: "destructive"
            });
        }
    }
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
  );
}
