"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Camera, AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export const CameraScreen = ({ onCapture }: { onCapture: (imageDataUri: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsCameraReady(false);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied. Please enable camera permissions in your browser settings.");
      }
    } else {
      setError("Your browser does not support camera access.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
        // Flip the context horizontally to un-mirror the selfie
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        onCapture(dataUri);
    }
  };

  return (
    <Card className="shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-center font-headline">Smile for the Camera!</CardTitle>
        <CardDescription className="text-center">Center your face in the frame.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden border">
          {!isCameraReady && !error && <Skeleton className="h-full w-full" />}
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4"/>
              <p className="font-semibold">Camera Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={startCamera} variant="outline" size="sm" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCapture} disabled={!isCameraReady || !!error} className="w-full" size="lg">
          <Camera className="mr-2 h-5 w-5" />
          Capture Mood
        </Button>
      </CardFooter>
    </Card>
  );
};
