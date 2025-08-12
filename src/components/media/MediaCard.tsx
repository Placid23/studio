'use client';

import Link from 'next/link';
import type { Movie, Show } from '@/lib/types';
import { Star, PlayCircle, PlusCircle } from 'lucide-react';
import { ImageLoader } from './ImageLoader';
import { HoldToDeleteButton } from './HoldToDeleteButton';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { addMediaToLibraryAction } from '@/app/search/actions';
import { useTransition } from 'react';

interface MediaCardProps {
  media: Movie | Show;
  onRemove?: (id: string) => void;
  watchHref?: string;
  showAddButton?: boolean;
}

export function MediaCard({ media, onRemove, watchHref: customWatchHref, showAddButton = false }: MediaCardProps) {
  const isMovie = media.type === 'movie';
  const href = isMovie ? `/movies/${media.tmdbId}` : `/shows/${media.tmdbId}`;
  const hint = isMovie ? "movie poster" : "tv show poster";
  const watchHref = customWatchHref || (isMovie 
    ? `/watch/${media.tmdbId}` 
    : `/watch/${media.tmdbId}?season=1&episode=1`);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
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
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border-2 border-transparent shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-primary/20 group-hover:shadow-2xl img-container">
          <ImageLoader
            src={media.posterUrl!}
            alt={media.title}
            fill
            style={{objectFit: "cover"}}
            className="transition-opacity duration-300"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
            data-ai-hint={hint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {media.supabaseId && (
            <Link href={watchHref} passHref>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
                <PlayCircle className="h-20 w-20 text-white/90 drop-shadow-lg transform transition-transform group-hover:scale-110" />
              </div>
            </Link>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-base font-bold drop-shadow-lg truncate">{media.title}</h3>
            {media.rating > 0 && (
              <div className="flex items-center gap-1 text-xs mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{media.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
      {onRemove && (
        <HoldToDeleteButton onDelete={() => onRemove(media.tmdbId)} />
      )}
      {showAddButton && (
        <Button 
            onClick={handleAdd} 
            disabled={isPending}
            variant="outline" 
            size="sm" 
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 hover:bg-background/90"
        >
            <PlusCircle className="mr-2 h-4 w-4" /> {isPending ? 'Adding...' : 'Add'}
        </Button>
      )}
    </div>
  );
}
