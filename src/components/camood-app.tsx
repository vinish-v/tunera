
"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { moodPlaylists, moodEmojis, Mood, Song } from '@/lib/mock-data';

import { IntroScreen } from '@/components/screens/intro-screen';
import { CameraScreen } from '@/components/screens/camera-screen';
import { LoadingScreen } from '@/components/screens/loading-screen';
import { ResultsScreen } from '@/components/screens/results-screen';

type Step = 'intro' | 'camera' | 'loading' | 'results';

// Shuffle function to add variety to refreshed playlists
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export default function TuneraApp() {
  const [step, setStep] = useState<Step>('intro');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [moodResult, setMoodResult] = useState<{ mood: string; emoji: string } | null>(null);
  const [selfieDataUri, setSelfieDataUri] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [songHistory, setSongHistory] = useState<Song[]>([]);
  const [isSuggestingSongs, setIsSuggestingSongs] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleCapture = async (imageDataUri: string) => {
    if (!imageDataUri) {
        toast({
            title: "Capture Failed",
            description: "Could not get image data. Please try again.",
            variant: "destructive",
        });
        setStep('camera');
        return;
    }
    setSelfieDataUri(imageDataUri);
    setStep('loading');
    setLoadingMessage('Analyzing your vibe...');

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // No AI call: Pick a random mood from the mock data
    const moods = Object.keys(moodPlaylists) as Mood[];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    
    setMoodResult({ mood: randomMood, emoji: moodEmojis[randomMood] });
    setLoadingMessage('Finding your perfect playlist...');
    
    // Simulate playlist fetching delay
    await new Promise(resolve => setTimeout(resolve, 1000));
      
    const suggestedSongs = moodPlaylists[randomMood];
    
    setSongs(suggestedSongs);
    setSongHistory(suggestedSongs);
    setRefreshKey(Date.now());

    setStep('results');
  };

  const handleRefreshSongs = async () => {
    if (!moodResult?.mood) return;

    setIsSuggestingSongs(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const currentPlaylist = moodPlaylists[moodResult.mood as Mood];
      const shuffledSongs = shuffleArray([...currentPlaylist]);
      
      setSongs(shuffledSongs);
      setRefreshKey(Date.now());
    } catch (error) {
      console.error("Failed to refresh songs", error);
      toast({
        title: "Couldn't get new songs",
        description: "There was an issue fetching new song suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingSongs(false);
    }
  };

  const handleReset = () => {
    setStep('intro');
    setMoodResult(null);
    setSelfieDataUri(null);
    setSongs([]);
    setSongHistory([]);
    setLoadingMessage('');
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return <IntroScreen onStart={() => setStep('camera')} />;
      case 'camera':
        return <CameraScreen onCapture={handleCapture} />;
      case 'loading':
        return <LoadingScreen message={loadingMessage} />;
      case 'results':
        return <ResultsScreen 
          key={refreshKey}
          refreshKey={refreshKey}
          moodResult={moodResult!}
          selfieDataUri={selfieDataUri!}
          songs={songs} 
          onReset={handleReset} 
          onRefresh={handleRefreshSongs}
          isRefreshing={isSuggestingSongs}
        />;
      default:
        return <IntroScreen onStart={() => setStep('camera')} />;
    }
  };

  return <div className="w-full max-w-lg mx-auto">{renderStep()}</div>;
}
