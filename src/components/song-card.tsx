"use client";

import Image from 'next/image';
import { Play, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import type SpotifyWebApi from 'spotify-web-api-node';
import { Skeleton } from './ui/skeleton';

type Song = { title: string; artist: string };

export function SongCard({ song, isSpotifyConnected }: { song: Song; isSpotifyConnected: boolean }) {
  const [track, setTrack] = useState<SpotifyApi.SingleTrackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSpotifyConnected) {
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
          setTrack(data);
        } else {
          console.error('Failed to fetch track from spotify');
          setTrack(null);
        }
      } catch (error) {
        console.error('Error fetching track:', error);
        setTrack(null);
      }
      setIsLoading(false);
    };

    fetchTrack();
  }, [song, isSpotifyConnected]);

  const songTitle = track?.name ?? song.title;
  const artistName = track?.artists.map(a => a.name).join(', ') ?? song.artist;
  const imageUrl = track?.album.images[0]?.url;
  const trackUrl = track?.external_urls.spotify;

  const PlayButtonContent = () => {
    if (trackUrl) {
      return <Play className="w-5 h-5 fill-current" />;
    }
    return <Music className="w-5 h-5" />;
  };

  const PlayButtonWrapper = ({ children }: { children: React.ReactNode }) => {
    if (trackUrl) {
      return (
        <a href={trackUrl} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return <>{children}</>;
  };

  if (isLoading && isSpotifyConnected) {
    return (
        <Card>
            <CardContent className="p-3 flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="bg-background/50 hover:bg-accent/50 hover:shadow-md transition-all duration-300">
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
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
             <Music className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-grow overflow-hidden">
          <p className="font-bold truncate" title={songTitle}>{songTitle}</p>
          <p className="text-sm text-muted-foreground truncate" title={artistName}>{artistName}</p>
        </div>
        <PlayButtonWrapper>
          <Button size="icon" variant="ghost" className="rounded-full flex-shrink-0" disabled={!trackUrl}>
            <PlayButtonContent />
          </Button>
        </PlayButtonWrapper>
      </CardContent>
    </Card>
  );
}
