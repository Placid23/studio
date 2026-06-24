'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Movie } from '@/lib/types';
import { MediaCard } from './MediaCard';
import { getPopularMovies } from '@/lib/tmdb';
import { Loader2 } from 'lucide-react';

interface MoviesInfiniteScrollProps {
  initialMovies: Movie[];
}

export function MoviesInfiniteScroll({ initialMovies }: MoviesInfiniteScrollProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchMoreMovies = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      // Note: In real app, you might want to call a server action or proxy to avoid public API expose
      // But getPopularMovies is already exported from lib/tmdb. 
      // We will re-use it here directly as it is safe for client-side if NEXT_PUBLIC_TMDB_API_KEY exists.
      const data = await getPopularMovies(nextPage);
      
      if (data.results.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => [...prev, ...data.results]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error("Error fetching more movies", e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMoreMovies();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchMoreMovies, hasMore]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((movie, idx) => (
          <MediaCard key={`${movie.tmdbId}-${idx}`} media={movie} />
        ))}
      </div>

      {hasMore && (
        <div 
          ref={observerRef} 
          className="flex justify-center py-20 bg-card/10 rounded-[3rem] border border-white/5 border-dashed"
        >
          {loading && (
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Cinema Multiverse...</p>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && (
          <div className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest text-xs">
              End of Cinematic Data
          </div>
      )}
    </div>
  );
}
