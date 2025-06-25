"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Music } from 'lucide-react';

export const IntroScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <Card className="text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="p-6 sm:p-8">
        <CardTitle className="text-3xl sm:text-4xl font-headline flex items-center justify-center gap-2">
            <Music className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            Camood
        </CardTitle>
        <CardDescription className="pt-2 text-sm sm:text-base">
            Discover music that matches your mood.
            <br />
            Just take a selfie and let our AI do the rest.
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-6 sm:p-8 pt-4">
        <Button onClick={onStart} className="w-full" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Find My Vibe
        </Button>
      </CardFooter>
    </Card>
  );
};
