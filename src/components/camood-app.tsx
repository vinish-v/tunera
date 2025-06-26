
"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Song } from '@/lib/mock-data';
import { getVibeFromImage } from '@/app/actions';

import { IntroScreen } from '@/components/screens/intro-screen';
import { CameraScreen } from '@/components/screens/camera-screen';
import { LoadingScreen } from '@/components/screens/loading-screen';
import { ResultsScreen } from '@/components/screens/results-screen';

type Step = 'intro' | 'camera' | 'loading' | 'results';

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

    const result = await getVibeFromImage({ photoDataUri: imageDataUri });
    
    if (!result) {
        toast({
            title: "Analysis Failed",
            description: "Could not analyze the image. Please try again or check your API key.",
            variant: "destructive",
        });
        setStep('camera');
        return;
    }

    setMoodResult({ mood: result.mood, emoji: result.emoji });
    setLoadingMessage('Finding your perfect playlist...');
    
    setSongs(result.songs);
    setSongHistory(result.songs);
    setRefreshKey(Date.now());
    setStep('results');
  };

  const handleRefreshSongs = async () => {
    if (!selfieDataUri) return;

    setIsSuggestingSongs(true);
    try {
      const result = await getVibeFromImage({ photoDataUri: selfieDataUri, previousSongs: songHistory });
      
      if (!result) {
        throw new Error("AI failed to generate new songs.");
      }
      
      setMoodResult({ mood: result.mood, emoji: result.emoji });
      setSongs(result.songs);
      setSongHistory(prevHistory => {
        const newHistory = [...prevHistory, ...result.songs];
        // Keep only the most recent 100 songs to avoid a huge prompt
        if (newHistory.length > 100) {
            return newHistory.slice(newHistory.length - 100);
        }
        return newHistory;
      });
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
