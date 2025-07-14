
import { MediaCard } from '@/components/media/MediaCard';
import type { Show } from '@/lib/types';
import { getPopularShows } from '@/lib/tvmaze';
import { AlertTriangle, Clapperboard } from 'lucide-react';


export default async function ShowsPage() {
  let shows: Show[] = [];
  let fetchError: string | null = null;

  try {
    shows = await getPopularShows();
  } catch (e: any) {
    fetchError = e.message || "An unknown error occurred.";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-primary uppercase tracking-wider mb-8">
        Popular TV Shows
      </h1>
      {fetchError && <p className="text-destructive">Error loading shows: {fetchError}</p>}
      {shows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {shows.map((show) => (
            <MediaCard key={show.id} media={show} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Clapperboard className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">No Shows Found</h2>
          <p className="mt-2 text-muted-foreground">Could not fetch shows from TVMaze.</p>
        </div>
      )}
    </div>
  );
}
