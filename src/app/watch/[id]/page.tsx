
import { notFound } from 'next/navigation';
import { getMovieDetails, getShowDetails } from '@/lib/tmdb';
import type { Movie, Show } from '@/lib/types';
import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle } from 'lucide-react';

export default async function WatchPage({ params }: { params: { id: string } }) {
  // Fetch movie and show details sequentially to avoid race condition errors.
  let media: Movie | Show | null = await getMovieDetails(params.id);
  if (!media) {
    media = await getShowDetails(params.id);
  }

  if (!media) {
    notFound();
  }

  return (
    <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
      <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
        <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center p-4 h-full">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Streaming Not Available</h1>
            <p className="text-muted-foreground max-w-md">This feature is currently not supported.</p>
        </div>
      </main>
    </div>
  );
}
