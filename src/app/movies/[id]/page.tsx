import type { Movie } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Calendar, PlusCircle, Play } from 'lucide-react';
import { TrailerPlayer } from '@/components/media/TrailerPlayer';
import { SimilarMedia } from '@/components/media/SimilarMedia';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/BackButton';
import { getMovieDetails } from '@/lib/tmdb';
import { ImageLoader } from '@/components/media/ImageLoader';
import { WatchHistoryTracker } from '@/components/media/WatchHistoryTracker';
import { StreamingProviders, StreamingProvidersSkeleton } from '@/components/media/StreamingProviders';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const movieId = params.id.split('-')[0];
  if (isNaN(Number(movieId))) {
    notFound();
  }

  const movie = await getMovieDetails(movieId);

  if (!movie) {
    notFound();
  }

  let supabaseMovie: { id: any; telegram_file_id: string | null } | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('movies')
      .select('id, telegram_file_id')
      .ilike('title', `${movie.title}%`)
      .eq('type', 'movie')
      .limit(1);
      
    if (error) {
      console.error('Supabase query error:', error.message);
    } else if (data && data.length > 0) {
      supabaseMovie = data[0];
    }
  }

  return (
    <div className="animate-in fade-in-50 duration-500">
      <WatchHistoryTracker media={movie} />
      <div className="relative h-[45vh] md:h-[65vh] w-full">
        <ImageLoader
          src={movie.backdropUrl}
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
              src={movie.posterUrl}
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
              {movie.duration && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{movie.duration} min</span>
                  </div>
                </>
              )}
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
              {supabaseMovie && supabaseMovie.telegram_file_id && (
                 <Link href={`/watch/${supabaseMovie.id}`} passHref>
                    <Button size="lg" variant="secondary">
                      <Play className="mr-2 h-6 w-6" />
                      Stream Now
                    </Button>
                 </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Trailer</h2>
            <TrailerPlayer posterUrl={movie.backdropUrl} trailerUrl={movie.trailerUrl} />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Cast & Crew</h2>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 h-full">
              <div className="space-y-6">
                {movie.director && (
                  <div>
                    <p className="font-semibold text-muted-foreground tracking-widest text-sm uppercase">Director</p>
                    <p className="text-lg text-foreground/90 mt-1">{movie.director}</p>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <p className="font-semibold text-muted-foreground tracking-widest text-sm uppercase">Cast</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                      {movie.cast.map((actor) => <span key={actor} className="text-foreground/90 truncate">{actor}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<StreamingProvidersSkeleton />}>
          <StreamingProviders media={movie} />
        </Suspense>
        
        <div className="mt-16">
          <Suspense fallback={<SimilarMedia.Skeleton />}>
            <SimilarMedia media={movie} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
