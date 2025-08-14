
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Show, Episode, Season } from '@/lib/types';
import { getEpisodesForSeason } from '@/app/shows/[id]/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '../ui/skeleton';
import { ImageLoader } from './ImageLoader';
import Link from 'next/link';
import { Button } from '../ui/button';
import { PlayCircle, Download, Loader2 } from 'lucide-react';
import { downloadAnimeEpisodeAction } from '@/app/anime/[id]/actions';
import { useToast } from '@/hooks/use-toast';

export function EpisodeGuide({ show }: { show: Show }) {
  const seasons = show.seasons?.filter(s => s.season_number > 0) || [];
  const [selectedSeason, setSelectedSeason] = useState<string>(String(seasons[0]?.season_number || '1'));
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const fetchedEpisodes = await getEpisodesForSeason(show.tmdbId, Number(selectedSeason));
      setEpisodes(fetchedEpisodes);
    });
  }, [selectedSeason, show.tmdbId]);

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={String(season.season_number)}>
                {season.name} {season.episode_count ? `(${season.episode_count} Episodes)` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <EpisodeCardSkeleton key={i} />)
          : episodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} show={show} />
          ))}
      </div>
    </div>
  );
}

function EpisodeCard({ episode, show }: { episode: Episode; show: Show; }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    startTransition(async () => {
      const result = await downloadAnimeEpisodeAction(show, episode);
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    });
  };

  return (
    <div className="bg-card/60 rounded-lg overflow-hidden flex flex-col group">
      <Link href={`/watch/${show.tmdbId}?season=${episode.season_number}&episode=${episode.episode_number}`}>
        <div className="relative aspect-video img-container">
          <ImageLoader
            src={episode.still_path!}
            alt={episode.name}
            fill
            style={{objectFit: 'cover'}}
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="tv episode still"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
            <PlayCircle className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </div>
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg">
          E{episode.episode_number}: {episode.name}
        </h3>
        <p className="text-muted-foreground text-sm mt-2 flex-1 line-clamp-3">{episode.synopsis}</p>
        <div className="mt-4 w-full flex items-center gap-2">
            <Button asChild variant="secondary" className="flex-1">
               <Link href={`/watch/${show.tmdbId}?season=${episode.season_number}&episode=${episode.episode_number}`}>
                  <PlayCircle className="mr-2 h-4 w-4" /> Play
                </Link>
            </Button>
             <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download
            </Button>
        </div>
      </div>
    </div>
  );
}

function EpisodeCardSkeleton() {
  return (
    <div className="bg-card/60 rounded-lg overflow-hidden flex flex-col">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-3" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <div className="flex items-center gap-2 mt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
