"use client";

import Image from 'next/image';
import { Play, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
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

  if (isLoading && isSpotifyConnected) {
    return (
        <Card>
            <CardContent className="p-3 flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                 <div className="flex-shrink-0">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  const cardInnerContent = (
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
        {trackUrl && (
            <div className="flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                <Play className="w-5 h-5 fill-current" />
            </div>
        )}
    </CardContent>
  );

  const cardComponent = (
    <Card className={`bg-background/50 group hover:bg-accent/50 hover:shadow-md transition-all duration-300 ${trackUrl ? 'cursor-pointer' : ''}`}>
      {cardInnerContent}
    </Card>
  );
  
  if (trackUrl) {
    return (
      <a href={trackUrl} target="_blank" rel="noopener noreferrer" className="block">
        {cardComponent}
      </a>
    );
  }

  return cardComponent;
}
