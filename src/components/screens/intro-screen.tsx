"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Music } from 'lucide-react';
import Image from 'next/image';

export const IntroScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <Card className="text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="p-8">
        <CardTitle className="text-4xl font-headline flex items-center justify-center gap-2">
            <Music className="w-10 h-10 text-primary" />
            Camood
        </CardTitle>
        <CardDescription className="pt-2 text-base">
            Discover music that matches your mood.
            <br />
            Just take a selfie and let our AI do the rest.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8">
        <Image 
          src="https://placehold.co/600x400.png" 
          alt="Abstract representation of music and emotions"
          data-ai-hint="music emotion"
          width={600}
          height={400}
          className="rounded-lg shadow-md"
        />
      </CardContent>
      <CardFooter className="p-8">
        <Button onClick={onStart} className="w-full" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Find My Vibe
        </Button>
      </CardFooter>
    </Card>
  );
};
