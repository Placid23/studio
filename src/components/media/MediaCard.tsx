'use client';

import Link from 'next/link';
import type { Movie, Show } from '@/lib/types';
import { Star, CirclePlay, PlusCircle } from 'lucide-react';
import { ImageLoader } from './ImageLoader';
import { HoldToDeleteButton } from './HoldToDeleteButton';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { addMediaToLibraryAction } from '@/app/search/actions';
import { useTransition, useState, useEffect } from 'react';

interface MediaCardProps {
  media: Movie | Show;
  onRemove?: (id: string) => void;
  showAddButton?: boolean;
}

export function MediaCard({ media, onRemove, showAddButton = false }: MediaCardProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let href = '';
  let hint = '';
  switch (media.type) {
    case 'movie':
      href = `/movies/${media.tmdbId}`;
      hint = 'movie poster';
      break;
    case 'tv':
      href = `/shows/${media.tmdbId}`;
      hint = 'tv show poster';
      break;
    case 'anime':
      href = `/anime/${media.tmdbId}`;
      hint = 'anime poster';
      break;
    default:
      href = '#';
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await addMediaToLibraryAction(media);
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };

  return (
    <div className="group relative w-full flex-shrink-0 transition-all duration-500 hover:z-10">
      <Link href={href} className="block w-full">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2rem] border-2 border-transparent shadow-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.08] group-hover:border-primary group-hover:shadow-primary/30 img-container bg-card">
          <ImageLoader
            src={media.posterUrl!}
            alt={media.title}
            fill
            style={{ objectFit: "cover" }}
            className="transition-opacity duration-300"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
            data-ai-hint={hint}
          />
          
          {/* Static UI - Safe for SSR to prevent hydration flickering */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent transition-opacity duration-300 group-hover:via-black/40 z-10" />

          {/* Overlays - Use pure CSS opacity to avoid hydration mismatches */}
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[4px]">
            <CirclePlay className="h-16 w-16 text-white/90 drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-110" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
            <h3 className="text-sm font-black drop-shadow-lg truncate leading-none uppercase tracking-tighter mb-1">{media.title}</h3>
            {media.rating > 0 && (
              <div className="flex items-center gap-1 opacity-80">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] font-black tracking-widest">{media.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {mounted && (
            <>
              {onRemove && (
                <HoldToDeleteButton onDelete={() => onRemove(media.tmdbId)} className="z-30" />
              )}

              {showAddButton && (
                <Button
                  onClick={handleAdd}
                  disabled={isPending}
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/60 hover:bg-primary hover:text-white h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/10 backdrop-blur-md"
                >
                  {isPending ? '...' : <><PlusCircle className="mr-1.5 h-3.5 w-3.5" /> ADD</>}
                </Button>
              )}
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
