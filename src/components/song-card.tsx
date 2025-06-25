"use client";

import Image from 'next/image';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock artists for a more realistic UI, as the AI tool only returns song titles.
const mockArtists: { [key: string]: string } = {
  'Walking on Sunshine': 'Katrina & The Waves',
  'Happy': 'Pharrell Williams',
  'Lovely Day': 'Bill Withers',
  'Hallelujah': 'Leonard Cohen',
  'Tears in Heaven': 'Eric Clapton',
  'Someone Like You': 'Adele',
  'Uptown Funk': 'Mark Ronson ft. Bruno Mars',
  'September': 'Earth, Wind & Fire',
  'Don\'t Stop Me Now': 'Queen',
  'Watermark': 'Enya',
  'Clair de Lune': 'Claude Debussy',
  'A Sky Full of Stars': 'Coldplay',
  'Perfect': 'Ed Sheeran',
  'All of Me': 'John Legend',
  'Can\'t Help Falling in Love': 'Elvis Presley',
  'Default Song 1': 'The Defaults',
  'Default Song 2': 'The Defaults',
  'Default Song 3': 'The Defaults',
};

export function SongCard({ songTitle }: { songTitle: string }) {
  const artist = mockArtists[songTitle] || 'Various Artists';

  return (
    <Card className="bg-background/50 hover:bg-accent/50 hover:shadow-md transition-all duration-300">
      <CardContent className="p-3 flex items-center gap-4">
        <Image 
          src="https://placehold.co/64x64.png" 
          alt="Album art" 
          width={64} 
          height={64} 
          className="rounded-md"
          data-ai-hint="album cover"
        />
        <div className="flex-grow overflow-hidden">
          <p className="font-bold truncate" title={songTitle}>{songTitle}</p>
          <p className="text-sm text-muted-foreground truncate" title={artist}>{artist}</p>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full flex-shrink-0">
          <Play className="w-5 h-5 fill-current" />
        </Button>
      </CardContent>
    </Card>
  );
}
