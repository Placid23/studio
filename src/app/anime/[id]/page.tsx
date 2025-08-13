
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, PlayCircle } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { ImageLoader } from '@/components/media/ImageLoader';
import { WatchHistoryTracker } from '@/components/media/WatchHistoryTracker';
import { Suspense } from 'react';
import { getShowDetails } from '@/lib/tmdb';
import { TrailerPlayer } from '@/components/media/TrailerPlayer';
import { SimilarMedia } from '@/components/media/SimilarMedia';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EpisodeGuide } from '@/components/media/EpisodeGuide';
import type { Show } from '@/lib/types';
import { AddToWatchlistButton } from '@/components/media/AddToWatchlistButton';
import { addToWatchlistAction } from './actions';
import { DownloadButton } from '@/components/media/DownloadButton';
import { createClient } from '@/lib/supabase/server';

async function getLibraryItem(tmdbId: string) {
    const supabase = createClient();
    const { data } = await supabase.from('movies').select('file_id').eq('tmdb_id', tmdbId).single();
    return data;
}


export default async function AnimeDetailPage({ params }: { params: { id: string } }) {
  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive">TMDB API Key Missing</h1>
          <p className="mt-2 text-destructive/80">The NEXT_PUBLIC_TMDB_API_KEY environment variable is not configured.</p>
        </div>
      </div>
    );
  }
  
  const show = await getShowDetails(params.id);

  if (!show) {
    notFound();
  }

  // Override the type for UI purposes
  const anime: Show = { ...show, type: 'anime' };
  const libraryItem = await getLibraryItem(params.id);

  return (
    <div className="animate-in fade-in-50 duration-500">
      <WatchHistoryTracker media={anime} />
      <div className="relative h-[45vh] md:h-[65vh] w-full img-container">
        <ImageLoader
          src={anime.backdropUrl!}
          alt={`Backdrop for ${anime.title}`}
          fill
          style={{ objectFit: 'cover' }}
          className=""
          priority
          data-ai-hint="anime backdrop"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="container mx-auto -mt-32 md:-mt-48 relative z-10 px-4 md:px-8 pb-16">
        <BackButton />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 img-container rounded-lg shadow-2xl">
            <ImageLoader
              src={anime.posterUrl!}
              alt={`Poster for ${anime.title}`}
              width={500}
              height={750}
              className="rounded-lg"
              data-ai-hint="anime poster"
            />
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4 text-foreground pt-8 md:pt-16">
            <h1 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-wide">{anime.title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 text-muted-foreground">
              {anime.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-lg text-foreground">{anime.rating.toFixed(1)}</span>
                </div>
              )}
              {anime.year > 0 && (
                <>
                   {anime.rating > 0 && <span className="text-muted-foreground/50">|</span>}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{anime.year}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {anime.genres.map((genre) => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-lg text-foreground/90">{anime.synopsis}</p>
            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <Button asChild size="lg">
                <Link href={`/watch/${anime.tmdbId}?season=1&episode=1`}>
                    <PlayCircle className="mr-2 h-6 w-6" />
                    Watch Now
                </Link>
              </Button>
              <AddToWatchlistButton media={anime} addAction={addToWatchlistAction} />
              {libraryItem?.file_id && (
                  <DownloadButton 
                      filePath={libraryItem.file_id}
                      bucket="videos"
                      fileName={`${anime.title}.mp4`}
                  />
              )}
            </div>
          </div>
        </div>
        
        {anime.seasons && anime.seasons.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Episodes</h2>
            <EpisodeGuide show={anime} />
          </div>
        )}

        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Trailer</h2>
            <TrailerPlayer posterUrl={anime.backdropUrl!} trailerUrl={anime.trailerUrl} />
        </div>
        
        <Suspense fallback={null}>
            <SimilarMedia mediaId={anime.tmdbId} mediaType="tv" />
        </Suspense>

      </div>
    </div>
  );
}
