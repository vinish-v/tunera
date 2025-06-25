"use client";

import { Card, CardContent } from "@/components/ui/card";

const Spinner = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin text-primary"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );

export const LoadingScreen = ({ message }: { message: string }) => {
  return (
    <Card className="shadow-2xl animate-in fade-in duration-500">
        <CardContent className="p-12 flex flex-col items-center justify-center gap-6">
            <Spinner />
            <p className="text-lg text-muted-foreground font-semibold animate-pulse">{message}</p>
        </CardContent>
    </Card>
  );
};
