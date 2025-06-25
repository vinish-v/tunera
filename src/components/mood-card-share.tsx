"use client";

import React from 'react';
import Image from 'next/image';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

type Song = { title: string; artist: string };

interface MoodCardShareProps extends React.HTMLAttributes<HTMLDivElement> {
    selfieDataUri: string;
    emoji: string;
    mood: string;
    song?: Song;
    imageUrl?: string;
}

export const MoodCardShare = React.forwardRef<HTMLDivElement, MoodCardShareProps>(
    ({ selfieDataUri, emoji, mood, song, imageUrl, className, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("relative aspect-[9/16] w-full max-w-[300px] mx-auto overflow-hidden rounded-lg bg-card", className)} {...props}>
                {selfieDataUri && (
                    <Image src={selfieDataUri} alt="User selfie" layout="fill" objectFit="cover" />
                )}
                <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                
                <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                    <div className="text-left">
                        <h2 className="text-xl font-bold font-headline drop-shadow-lg">Camood</h2>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="text-7xl drop-shadow-lg">{emoji}</div>
                        <p className="text-2xl font-bold drop-shadow-lg capitalize font-headline">Feeling {mood}</p>
                    </div>

                    {song ? (
                        <div className="text-left">
                            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md p-3 rounded-lg">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={`Album art for ${song.title}`}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-md flex-shrink-0 object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-white/30 rounded-md flex items-center justify-center flex-shrink-0">
                                        <Music className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="overflow-hidden">
                                    <p className="font-semibold truncate">{song.title}</p>
                                    <p className="text-sm opacity-80 truncate">{song.artist}</p>
                                </div>
                            </div>
                        </div>
                    ) : <div />}
                </div>
            </div>
        );
    }
);
MoodCardShare.displayName = 'MoodCardShare';
