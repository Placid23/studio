
'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageLoader } from './ImageLoader';
import type { SearchedTrack } from '@/lib/musicbrainz';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { addMusicTrackAction } from '@/app/music/search/actions';

interface CarouselItem {
    id: string;
    type: 'playlist' | 'album' | 'track';
    title: string;
    artist?: string;
    coverUrl?: string;
}

interface MusicCarouselProps {
  title: string;
  items: CarouselItem[];
}

export function MusicCarousel({ title, items }: MusicCarouselProps) {
  if (!items || items.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
   const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleAdd = (item: CarouselItem) => {
    // This is a simplified add action. We assume the CarouselItem has enough
    // info to be added as a SearchedTrack. This might need adjustment
    // depending on what `addMusicTrackAction` requires.
    const trackToAdd: SearchedTrack = {
      mbid: item.id,
      title: item.title,
      artist: item.artist || 'Unknown Artist',
      album: item.type === 'album' ? item.title : 'Single',
      coverUrl: item.coverUrl,
    };

    startTransition(async () => {
      const result = await addMusicTrackAction(trackToAdd);
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };


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
          {items.map((item) => (
            <div key={item.id} className="w-40 flex-shrink-0 sm:w-48 md:w-56 group">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-transparent shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-primary/20 group-hover:shadow-2xl img-container">
                    <ImageLoader
                        src={item.coverUrl || 'https://placehold.co/300x300.png'}
                        alt={item.title}
                        fill
                        style={{objectFit: "cover"}}
                        className="transition-opacity duration-300"
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
                        data-ai-hint="album art"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                     <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-base font-bold drop-shadow-lg truncate">{item.title}</h3>
                         {item.artist && (
                            <p className="text-xs text-white/80 truncate">{item.artist}</p>
                         )}
                    </div>
                </div>
                 <Button 
                    onClick={() => handleAdd(item)} 
                    disabled={isPending}
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> {isPending ? 'Adding...' : 'Add to Library'}
                </Button>
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


export function MusicCarouselSkeleton() {
  return (
      <div className="w-full">
          <Skeleton className="h-8 w-1/3 mb-4 rounded-md" />
          <div className="relative">
              <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="w-40 flex-shrink-0 sm:w-48 md:w-56">
                          <div className="aspect-square w-full">
                              <Skeleton className="w-full h-full rounded-lg" />
                          </div>
                           <Skeleton className="h-8 w-full rounded-md mt-2" />
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
}
