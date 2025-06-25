"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { predictMoodFromSelfie } from '@/ai/flows/predict-mood-from-selfie';
import { suggestSongsForMood } from '@/ai/flows/suggest-songs-for-mood';

import { IntroScreen } from '@/components/screens/intro-screen';
import { CameraScreen } from '@/components/screens/camera-screen';
import { LoadingScreen } from '@/components/screens/loading-screen';
import { ResultsScreen } from '@/components/screens/results-screen';

type Step = 'intro' | 'camera' | 'loading' | 'results';
type Song = { title: string; artist: string };

export default function CamoodApp({ isSpotifyConnected }: { isSpotifyConnected: boolean }) {
  const [step, setStep] = useState<Step>('intro');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [mood, setMood] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isSuggestingSongs, setIsSuggestingSongs] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [language, setLanguage] = useState('English');
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
    setStep('loading');
    try {
      setLoadingMessage('Analyzing your vibe...');
      const { mood: predictedMood } = await predictMoodFromSelfie({ photoDataUri: imageDataUri });
      
      if (!predictedMood) {
        throw new Error("Mood prediction returned empty.");
      }

      setMood(predictedMood);

      setLoadingMessage('Finding your perfect playlist...');
      const { songs: suggestedSongs } = await suggestSongsForMood({ mood: predictedMood, language });
      
      if (!suggestedSongs || suggestedSongs.length === 0) {
        throw new Error("Song suggestion returned empty.");
      }
      
      setSongs(suggestedSongs);
      setRefreshKey(Date.now());

      setStep('results');
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "We couldn't generate your playlist. Please try again.",
        variant: "destructive",
      });
      handleReset();
    }
  };

  const handleRefreshSongs = async (newLanguage?: string) => {
    if (!mood) return;

    setIsSuggestingSongs(true);
    try {
      const langToUse = newLanguage || language;
      const { songs: suggestedSongs } = await suggestSongsForMood({ mood, language: langToUse });

      if (!suggestedSongs || suggestedSongs.length === 0) {
        throw new Error("Song suggestion returned empty.");
      }

      setSongs(suggestedSongs);
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

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    handleRefreshSongs(newLanguage);
  }

  const handleReset = () => {
    setStep('intro');
    setMood('');
    setSongs([]);
    setLoadingMessage('');
    setLanguage('English');
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
          mood={mood} 
          songs={songs} 
          onReset={handleReset} 
          isSpotifyConnected={isSpotifyConnected}
          onRefresh={() => handleRefreshSongs()}
          isRefreshing={isSuggestingSongs}
          language={language}
          onLanguageChange={handleLanguageChange}
        />;
      default:
        return <IntroScreen onStart={() => setStep('camera')} />;
    }
  };

  return <div className="w-full max-w-lg mx-auto">{renderStep()}</div>;
}
