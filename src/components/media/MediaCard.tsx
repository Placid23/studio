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
    <div className="group relative w-full flex-shrink-0">
      <Link href={href} className="block w-full">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border-2 border-transparent shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-primary/20 group-hover:shadow-2xl img-container bg-card">
          <ImageLoader
            src={media.posterUrl!}
            alt={media.title}
            fill
            style={{ objectFit: "cover" }}
            className="transition-opacity duration-300"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
            data-ai-hint={hint}
          />
          
          {/* We hide dynamic overlays until mounted to prevent hydration mismatches */}
          {mounted && (
            <>
              {/* Overlay Layer 1: Enhanced Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" />

              {/* Overlay Layer 2: Play Icon */}
              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
                <CirclePlay className="h-16 w-16 text-white/90 drop-shadow-2xl transform transition-transform group-hover:scale-110" />
              </div>

              {/* Overlay Layer 3: Title & Rating Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20">
                <h3 className="text-sm font-bold drop-shadow-lg truncate leading-tight">{media.title}</h3>
                {media.rating > 0 && (
                  <div className="flex items-center gap-1 text-[10px] mt-1 opacity-80">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{media.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Link>

      {/* Action Buttons - Only rendered after mounting */}
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
              className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 hover:bg-background/90 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider border-white/10"
            >
              {isPending ? '...' : <><PlusCircle className="mr-1 h-3.5 w-3.5" /> Add</>}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
