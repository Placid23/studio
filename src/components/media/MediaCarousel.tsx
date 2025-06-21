'use client';

import { useRef } from 'react';
import { MediaCard } from './MediaCard';
import type { Movie, Show } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaCarouselProps {
  title: string;
  media: (Movie | Show)[];
}

export function MediaCarousel({ title, media }: MediaCarouselProps) {
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
      <div className="relative group">
        <div 
          ref={scrollRef}
          className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {media.map((item) => (
            <div key={item.id} className="w-40 flex-shrink-0 sm:w-48 md:w-56">
              <MediaCard media={item} />
            </div>
          ))}
        </div>
        
        <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden" />
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:block hidden" />

        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-24 w-14 rounded-r-lg rounded-l-none bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity z-20 md:flex items-center justify-center hidden"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-14 rounded-l-lg rounded-r-none bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity z-20 md:flex items-center justify-center hidden"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
