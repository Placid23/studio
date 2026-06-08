'use client';

import Link from 'next/link';
import type { Movie, Show } from '@/lib/types';
import { Star, PlayCircle, PlusCircle } from 'lucide-react';
import { ImageLoader } from './ImageLoader';
import { HoldToDeleteButton } from './HoldToDeleteButton';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { addMediaToLibraryAction } from '@/app/search/actions';
import { useState, useTransition, useEffect } from 'react';
import { VideoModal } from './VideoModal';

interface MediaCardProps {
  media: Movie | Show;
  onRemove?: (id: string) => void;
  watchHref?: string;
  showAddButton?: boolean;
}

export function MediaCard({ media, onRemove, watchHref: customWatchHref, showAddButton = false }: MediaCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Handle hydration mismatch by waiting for mount before rendering interactive elements
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

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoModalOpen(true);
  };

  return (
    <div className="group relative w-full flex-shrink-0">
      <Link href={href} className="block w-full">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border-2 border-transparent shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-primary/20 group-hover:shadow-2xl img-container">
          <ImageLoader
            src={media.posterUrl!}
            alt={media.title}
            fill
            style={{ objectFit: "cover" }}
            className="transition-opacity duration-300"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
            data-ai-hint={hint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

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

      {/* Only render interactive overlays after hydration to prevent mismatches */}
      {mounted && (
        <>
          <div
            onClick={handlePlayClick}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[2px] cursor-pointer rounded-lg"
          >
            <PlayCircle className="h-20 w-20 text-white/90 drop-shadow-lg transform transition-transform group-hover:scale-110" />
          </div>

          {onRemove && (
            <HoldToDeleteButton onDelete={() => onRemove(media.tmdbId)} className="z-20" />
          )}

          {showAddButton && (
            <Button
              onClick={handleAdd}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 hover:bg-background/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> {isPending ? 'Adding...' : 'Add'}
            </Button>
          )}

          <VideoModal
            title={media.title}
            type={media.type === 'movie' ? 'movie' : 'series'}
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
