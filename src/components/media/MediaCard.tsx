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
    <div className="group relative w-full flex-shrink-0 transition-all duration-500 hover:z-20">
      <Link href={href} className="block w-full">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2.5rem] border-2 border-white/5 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.1] group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(225,29,72,0.3)] img-container bg-card/40">
          <ImageLoader
            src={media.posterUrl!}
            alt={media.title}
            fill
            style={{ objectFit: "cover" }}
            className="transition-all duration-700 group-hover:blur-[2px] group-hover:scale-110"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
            data-ai-hint={hint}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-500 group-hover:via-black/60 z-10" />

          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
            <div className="p-4 bg-primary rounded-full shadow-[0_0_20px_rgba(225,29,72,0.6)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <CirclePlay className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-20 transform transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <h3 className="text-sm font-black drop-shadow-lg truncate leading-tight uppercase tracking-tighter mb-1.5">{media.title}</h3>
            {media.rating > 0 && (
              <div className="flex items-center gap-1 opacity-90">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
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
                  className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 hover:bg-primary hover:text-white h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-white/10 backdrop-blur-xl"
                >
                  {isPending ? '...' : <><PlusCircle className="mr-1.5 h-4 w-4" /> ADD</>}
                </Button>
              )}
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
