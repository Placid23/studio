'use client';

import { useRef, useMemo } from 'react';
import { MediaCard } from './MediaCard';
import type { Movie, Show } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaCarouselProps {
  title: string;
  media: (Movie | Show)[];
  onRemoveItem?: (id: string) => void;
}

export function MediaCarousel({ title, media, onRemoveItem }: MediaCarouselProps) {
  const carouselItems = useMemo(() => {
    if (!media || media.length === 0) return null;
    return media.map((item, index) => (
      <div key={`${title}-${item.tmdbId}-${index}`} className="w-40 flex-shrink-0 sm:w-52 md:w-64 px-3 snap-start">
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
    <div className="w-full group/carousel-outer">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground md:text-4xl flex items-center gap-3">
                <div className="h-10 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(225,29,72,0.6)]"></div>
                {title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                <Sparkle className="w-3 h-3 text-primary" />
                <span>Handpicked for your collection</span>
            </div>
        </div>
        <div className="flex gap-2">
            <Button 
                variant="outline" 
                size="icon" 
                className="rounded-2xl border-white/5 bg-card/30 hover:bg-primary hover:text-white transition-all shadow-2xl h-12 w-12 backdrop-blur-md"
                onClick={() => scroll('left')}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button 
                variant="outline" 
                size="icon" 
                className="rounded-2xl border-white/5 bg-card/30 hover:bg-primary hover:text-white transition-all shadow-2xl h-12 w-12 backdrop-blur-md"
                onClick={() => scroll('right')}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          className="scrollbar-hide -mx-4 flex overflow-x-auto px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x"
        >
          {carouselItems}
        </div>
      </div>
    </div>
  );
}


export function MediaCarouselSkeleton() {
  return (
      <div className="w-full px-2">
          <div className="h-12 w-1/4 mb-10 rounded-2xl bg-white/5 animate-pulse" />
          <div className="relative">
              <div className="scrollbar-hide -mx-4 flex space-x-6 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="w-40 flex-shrink-0 sm:w-52 md:w-64">
                          <div className="aspect-[2/3] w-full">
                              <Skeleton className="w-full h-full rounded-[2.5rem] bg-white/5" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
}
