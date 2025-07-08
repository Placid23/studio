import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Calendar, PlusCircle, Play, Film } from 'lucide-react';
import { Suspense } from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { ImageLoader } from '@/components/media/ImageLoader';
import { WatchHistoryTracker } from '@/components/media/WatchHistoryTracker';
import { StreamingProviders, StreamingProvidersSkeleton } from '@/components/media/StreamingProviders';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Movie } from '@/lib/types';


function mapSupabaseItemToMovie(item: any): Movie {
  return {
    id: String(item.id),
    supabaseId: item.id,
    title: item.title,
    type: 'movie',
    year: item.year || 0,
    genres: item.genres || [],
    rating: item.rating || 0,
    synopsis: item.synopsis || 'No synopsis available.',
    posterUrl: item.poster_url || 'https://placehold.co/500x750.png',
    backdropUrl: item.backdrop_url || 'https://placehold.co/1920x1080.png',
  };
}

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const movieId = params.id;
  
  const supabase = createClient();
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', movieId)
    .eq('type', 'movie')
    .single();

  if (error || !data) {
    notFound();
  }

  const movie = mapSupabaseItemToMovie(data);

  return (
    <div className="animate-in fade-in-50 duration-500">
      <WatchHistoryTracker media={movie} />
      <div className="relative h-[45vh] md:h-[65vh] w-full">
        <ImageLoader
          src={movie.backdropUrl!}
          alt={`Backdrop for ${movie.title}`}
          fill
          style={{objectFit: "cover"}}
          className="opacity-50"
          priority
          data-ai-hint="movie backdrop"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="container mx-auto -mt-32 md:-mt-48 relative z-10 px-4 md:px-8 pb-16">
        <BackButton />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 img-container rounded-lg shadow-2xl">
            <ImageLoader
              src={movie.posterUrl!}
              alt={`Poster for ${movie.title}`}
              width={500}
              height={750}
              className="rounded-lg"
              data-ai-hint="movie poster"
            />
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4 text-foreground pt-8 md:pt-16">
            <h1 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-wide">{movie.title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-lg text-foreground">{movie.rating.toFixed(1)}</span>
              </div>
              
              {movie.year > 0 && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{movie.year}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres.map((genre) => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-lg text-foreground/90">{movie.synopsis}</p>
            <div className="mt-8 flex items-center gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/80 text-accent-foreground">
                <PlusCircle className="mr-2 h-6 w-6" />
                Add to Watchlist
              </Button>
            </div>
          </div>
        </div>
        
        <Suspense fallback={<StreamingProvidersSkeleton />}>
          <StreamingProviders media={movie} />
        </Suspense>
      </div>
    </div>
  );
}
