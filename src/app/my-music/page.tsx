
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Library, Play, Pause, SkipBack, SkipForward, Music, Upload } from 'lucide-react';

export default function MyMusicPage() {
    const [playlist, setPlaylist] = useState<File[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const audioFiles = files.filter(file => file.type.startsWith('audio/'));
            setPlaylist(prev => {
                const newFiles = audioFiles.filter(f1 => !prev.some(f2 => f1.name === f2.name));
                return [...prev, ...newFiles];
            });
            // Reset the file input value to allow selecting the same file again
            event.target.value = '';
        }
    };
    
    const handlePlayPause = useCallback(() => {
        if (!audioRef.current || currentTrackIndex === null) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying, currentTrackIndex]);

    const playTrack = (index: number) => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    const handleNext = useCallback(() => {
        if (currentTrackIndex === null || playlist.length < 2) return;
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        playTrack(nextIndex);
    }, [currentTrackIndex, playlist.length]);
    
    const handlePrev = () => {
        if (currentTrackIndex === null || playlist.length < 2) return;
        const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        playTrack(prevIndex);
    };

    useEffect(() => {
        if (audioRef.current && currentTrackIndex !== null) {
            const trackUrl = URL.createObjectURL(playlist[currentTrackIndex]);
            audioRef.current.src = trackUrl;
            audioRef.current.play().catch(e => console.error("Playback failed", e));
            
            return () => {
                URL.revokeObjectURL(trackUrl);
            };
        }
    }, [currentTrackIndex, playlist]);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const onPlay = () => setIsPlaying(true);
            const onPause = () => setIsPlaying(false);
            const onEnded = () => handleNext();
            
            audio.addEventListener('play', onPlay);
            audio.addEventListener('pause', onPause);
            audio.addEventListener('ended', onEnded);
            
            return () => {
                audio.removeEventListener('play', onPlay);
                audio.removeEventListener('pause', onPause);
                audio.removeEventListener('ended', onEnded);
            }
        }
    }, [handleNext]);

    const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

    return (
        <main className="flex flex-1 flex-col items-center p-4 sm:p-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-center font-headline text-2xl sm:text-3xl flex items-center justify-center gap-2">
                        <Library className="w-7 h-7 sm:w-8 sm:h-8 text-primary"/>
                        My Music
                    </CardTitle>
                    <CardDescription className="text-center pt-2">
                        Play songs from your device.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => fileInputRef.current?.click()} size="lg">
                           <Upload className="mr-2 h-4 w-4" />
                           Add Songs from Device
                        </Button>
                        <Input 
                           type="file" 
                           multiple 
                           accept="audio/*" 
                           ref={fileInputRef} 
                           onChange={handleFileChange}
                           className="hidden"
                        />

                        {currentTrack && (
                            <div className="p-4 rounded-lg bg-muted flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <p className="font-semibold text-lg truncate" title={currentTrack.name}>{currentTrack.name}</p>
                                    <p className="text-sm text-muted-foreground">Now Playing</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="icon" onClick={handlePrev} disabled={playlist.length < 2}>
                                        <SkipBack />
                                    </Button>
                                    <Button variant="default" size="icon" className="w-14 h-14" onClick={handlePlayPause}>
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleNext} disabled={playlist.length < 2}>
                                        <SkipForward />
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        <ScrollArea className="h-64 border rounded-md">
                            <div className="p-2 space-y-1">
                                {playlist.length > 0 ? (
                                    playlist.map((file, index) => (
                                        <button 
                                            key={`${file.name}-${index}`}
                                            onClick={() => playTrack(index)} 
                                            className={`w-full text-left p-2 rounded-md flex items-center gap-3 transition-colors ${currentTrackIndex === index ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                        >
                                            <Music className="w-5 h-5 flex-shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground h-full p-8 flex flex-col items-center justify-center gap-2">
                                        <Music className="w-10 h-10" />
                                        <p className="font-semibold">Your playlist is empty.</p>
                                        <p className="text-sm">Click the button above to add songs.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                    <audio ref={audioRef} />
                </CardContent>
            </Card>
        </main>
    );
}
