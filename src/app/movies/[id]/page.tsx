import type { Movie } from '@/lib/types';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Calendar, PlusCircle } from 'lucide-react';
import { TrailerPlayer } from '@/components/movies/TrailerPlayer';
import SimilarMovies from '@/components/movies/SimilarMovies';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/layout/BackButton';
import { getMovieDetails } from '@/lib/tmdb';

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const movie = await getMovieDetails(params.id);

  if (!movie) {
    notFound();
  }

  return (
    <div className="animate-in fade-in-50 duration-500">
      <div className="relative h-[40vh] md:h-[60vh] w-full">
        <Image
          src={movie.backdropUrl}
          alt={`Backdrop for ${movie.title}`}
          fill
          style={{objectFit: "cover"}}
          className="opacity-50"
          priority
          data-ai-hint="movie backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="container mx-auto -mt-32 md:-mt-48 relative z-10 px-4 md:px-8 pb-16">
        <BackButton />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <Image
              src={movie.posterUrl}
              alt={`Poster for ${movie.title}`}
              width={500}
              height={750}
              className="rounded-lg shadow-2xl"
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
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{movie.duration} min</span>
                </div>
              )}
              {movie.year > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{movie.year}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres.map((genre) => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-lg text-foreground/90">{movie.synopsis}</p>
            <div className="mt-8">
              <Button size="lg" className="bg-accent hover:bg-accent/80 text-accent-foreground">
                <PlusCircle className="mr-2 h-6 w-6" />
                Add to Watchlist
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Trailer</h2>
            <TrailerPlayer posterUrl={movie.backdropUrl} />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Cast & Crew</h2>
            <div className="space-y-4">
              {movie.director && (
                <div>
                  <p className="font-semibold text-muted-foreground">Director</p>
                  <p className="text-lg text-foreground/90">{movie.director}</p>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <p className="font-semibold text-muted-foreground">Cast</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {movie.cast.map((actor) => <span key={actor} className="text-lg text-foreground/90">{actor}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <Suspense fallback={<SimilarMovies.Skeleton />}>
            <SimilarMovies movie={movie} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
