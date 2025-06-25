
"use client";

import TuneraApp from '@/components/camood-app';
import { ProtectedRoute } from '@/hooks/use-auth';

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
        <TuneraApp />
      </main>
    </ProtectedRoute>
  );
}
