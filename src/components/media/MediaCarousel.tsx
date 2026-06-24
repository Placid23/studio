'use client';

import { useRef, useMemo } from 'react';
import { MediaCard } from './MediaCard';
import type { Movie, Show } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaCarouselProps {
  title: string;
  media: (Movie | Show)[];
  onRemoveItem?: (id: string) => void;
}

export function MediaCarousel({ title, media, onRemoveItem }: MediaCarouselProps) {
  // Use useMemo to avoid recalculating the carousel content on every minor re-render
  const carouselItems = useMemo(() => {
    if (!media || media.length === 0) return null;
    return media.map((item, index) => (
      <div key={`${title}-${item.tmdbId}-${index}`} className="w-40 flex-shrink-0 sm:w-48 md:w-56 px-2">
        <MediaCard media={item} onRemove={onRemoveItem} />
      </div>
    ));
  }, [media, title, onRemoveItem]);

  if (!media || media.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount
        : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground md:text-3xl lg:text-4xl flex items-center gap-4">
            <span className="w-1.5 h-8 bg-primary rounded-full"></span>
            {title}
        </h2>
        <div className="flex gap-2">
            <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl border-white/5 bg-card/50 hover:bg-primary hover:text-white transition-all shadow-xl"
                onClick={() => scroll('left')}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl border-white/5 bg-card/50 hover:bg-primary hover:text-white transition-all shadow-xl"
                onClick={() => scroll('right')}
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
      </div>

      <div className="relative group/carousel">
        <div 
          ref={scrollRef}
          className="scrollbar-hide -mx-4 flex overflow-x-auto px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x"
        >
          {carouselItems}
        </div>
      </div>
    </div>
  );
}


export function MediaCarouselSkeleton() {
  return (
      <div className="w-full">
          <Skeleton className="h-10 w-1/3 mb-6 rounded-xl" />
          <div className="relative">
              <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="w-40 flex-shrink-0 sm:w-48 md:w-56">
                          <div className="aspect-[2/3] w-full">
                              <Skeleton className="w-full h-full rounded-[2rem]" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
}
