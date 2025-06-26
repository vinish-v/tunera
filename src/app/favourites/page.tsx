
"use client";

import { useState, useEffect } from 'react';
import { useFavourites } from '@/hooks/use-favourites';
import { SongCard } from '@/components/song-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Heart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from '@/components/ui/skeleton';

const platforms = ['YouTube', 'Spotify', 'YouTube Music', 'Amazon Music'];

export default function FavouritesPage() {
    const { favourites, isLoaded } = useFavourites();
    const [streamingPlatform, setStreamingPlatform] = useState('YouTube');
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const renderContent = () => {
        if (!hasMounted || !isLoaded) {
            return (
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}><CardContent className="p-3"><Skeleton className="h-16 w-full" /></CardContent></Card>
                    ))}
                </div>
            );
        }

        if (favourites.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-12">
                    <Heart className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-semibold">No Favourites Yet</p>
                    <p className="text-sm">Click the heart on a song card to add it to your favourites.</p>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {favourites.map((fav) => (
                    <SongCard
                        key={fav.id}
                        song={{ title: fav.title, artist: fav.artist }}
                        streamingPlatform={streamingPlatform}
                    />
                ))}
            </div>
        );
    };

    return (
        <main className="flex flex-1 flex-col items-center p-4 sm:p-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl sm:text-3xl flex items-center justify-center gap-2">
                        <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-primary"/>
                        Your Favourites
                    </CardTitle>
                    <CardDescription className="text-center pt-2">
                        Your saved tracks. Click a song to listen on your selected platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <Play className="w-5 h-5 text-muted-foreground" />
                            <Select onValueChange={setStreamingPlatform} defaultValue={streamingPlatform}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {platforms.map(platform => (
                                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {renderContent()}
                </CardContent>
            </Card>
        </main>
    );
}
