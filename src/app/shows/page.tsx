
import { MediaCard } from '@/components/media/MediaCard';
import type { Show } from '@/lib/types';
import { getPopularShows } from '@/lib/tmdb';
import { AlertTriangle, Clapperboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function TmdbError() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive">TMDB API Key Missing</h1>
        <p className="mt-2 text-destructive/80">The NEXT_PUBLIC_TMDB_API_KEY environment variable is not configured.</p>
      </div>
    </div>
  )
}

function PaginationControls({ currentPage, totalPages, basePath }: { currentPage: number, totalPages: number, basePath: string }) {
    const prevPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            {prevPage ? (
                 <Button asChild variant="outline">
                    <Link href={`${basePath}?page=${prevPage}`}>
                        <ChevronLeft />
                        Previous
                    </Link>
                </Button>
            ) : <Button variant="outline" disabled><ChevronLeft /> Previous</Button>}
           
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages > 500 ? 500 : totalPages}</span>

            {nextPage && (currentPage < 500) ? (
                 <Button asChild variant="outline">
                    <Link href={`${basePath}?page=${nextPage}`}>
                        Next
                        <ChevronRight />
                    </Link>
                </Button>
            ) : <Button variant="outline" disabled>Next <ChevronRight /></Button>}
        </div>
    )
}

export default async function ShowsPage({ searchParams }: { searchParams: { page?: string } }) {
  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    return <TmdbError />;
  }

  const currentPage = Number(searchParams?.page) || 1;
  let shows: Show[] = [];
  let totalPages = 0;
  let fetchError: string | null = null;

  try {
    const popularShows = await getPopularShows(currentPage);
    shows = popularShows.results;
    totalPages = popularShows.total_pages;
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
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {shows.map((show) => (
              <MediaCard key={show.tmdbId} media={show} />
            ))}
          </div>
          <PaginationControls currentPage={currentPage} totalPages={totalPages} basePath="/shows" />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Clapperboard className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">No Shows Found</h2>
          <p className="mt-2 text-muted-foreground">Could not fetch shows from TMDB.</p>
        </div>
      )}
    </div>
  );
}
