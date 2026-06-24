'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Show } from '@/lib/types';
import { MediaCard } from './MediaCard';
import { getPopularAnime } from '@/lib/tmdb';
import { Loader2 } from 'lucide-react';

interface AnimeInfiniteScrollProps {
  initialAnime: Show[];
}

export function AnimeInfiniteScroll({ initialAnime }: AnimeInfiniteScrollProps) {
  const [anime, setAnime] = useState<Show[]>(initialAnime);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchMoreAnime = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await getPopularAnime(nextPage);
      
      if (data.results.length === 0) {
        setHasMore(false);
      } else {
        setAnime((prev) => [...prev, ...data.results]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error("Error fetching more anime", e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMoreAnime();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchMoreAnime, hasMore]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {anime.map((show, idx) => (
          <MediaCard key={`${show.tmdbId}-${idx}`} media={show} />
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Scanning Multiverse...</p>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && (
          <div className="text-center py-20 text-muted-foreground font-bold uppercase tracking-widest text-xs">
              End of Anime Archive
          </div>
      )}
    </div>
  );
}
