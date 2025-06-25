
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from 'lucide-react';

export const IntroScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <Card className="text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <CardHeader className="p-6 sm:p-8">
        <CardTitle className="text-3xl sm:text-4xl font-headline">
            Tunera
        </CardTitle>
        <CardDescription className="pt-2 text-sm sm:text-base max-w-md mx-auto">
            Discover music that truly matches your mood. Just snap a selfie, and let our AI curate a personalized playlist for you. Save your favorite tracks and share your unique musical vibe with the world.
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-6 sm:p-8 pt-4">
        <Button onClick={onStart} className="w-full" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Find Your Vibe
        </Button>
      </CardFooter>
    </Card>
  );
};
