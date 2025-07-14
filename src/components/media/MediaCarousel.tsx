'use client';

import { useRef } from 'react';
import { MediaCard } from './MediaCard';
import type { Movie, Show } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaCarouselProps {
  title: string;
  media: (Movie | Show)[];
  onRemoveItem?: (id: string, source?: 'tmdb' | 'tvmaze') => void;
}

export function MediaCarousel({ title, media, onRemoveItem }: MediaCarouselProps) {
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
      <h2 className="mb-4 text-xl font-bold uppercase tracking-wider text-foreground/80 md:text-2xl lg:text-3xl">
        {title}
      </h2>
      <div className="relative group/carousel">
        <div 
          ref={scrollRef}
          className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {media.map((item, index) => (
            <div key={`${item.id}-${item.source || index}`} className="w-40 flex-shrink-0 sm:w-48 md:w-56">
              <MediaCard media={item} onRemove={onRemoveItem} />
            </div>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-24 w-14 rounded-r-lg rounded-l-none bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm z-20 md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-14 rounded-l-lg rounded-r-none bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm z-20 md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}


export function MediaCarouselSkeleton() {
  return (
      <div className="w-full">
          <Skeleton className="h-8 w-1/3 mb-4 rounded-md" />
          <div className="relative">
              <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="w-40 flex-shrink-0 sm:w-48 md:w-56">
                          <div className="aspect-[2/3] w-full">
                              <Skeleton className="w-full h-full rounded-lg" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
}
