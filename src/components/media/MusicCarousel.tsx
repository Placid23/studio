
'use client';

import { useRef } from 'react';
import { MusicCard } from './MusicCard';
import type { SpotifyAlbum } from '@/lib/spotify';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MusicCarouselProps {
  title: string;
  albums: SpotifyAlbum[];
}

export function MusicCarousel({ title, albums }: MusicCarouselProps) {
  if (!albums || albums.length === 0) return null;

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
          {albums.map((album) => (
            <div key={album.id} className="w-40 flex-shrink-0 sm:w-48 md:w-56">
              <MusicCard album={album} />
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
