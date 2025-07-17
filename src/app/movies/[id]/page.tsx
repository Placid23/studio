
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calendar, Film, PlayCircle } from 'lucide-react';
import { Suspense } from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { ImageLoader } from '@/components/media/ImageLoader';
import { WatchHistoryTracker } from '@/components/media/WatchHistoryTracker';
import { getMovieDetails } from '@/lib/tmdb';
import { TrailerPlayer } from '@/components/media/TrailerPlayer';
import { SimilarMedia } from '@/components/media/SimilarMedia';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
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
  
  const movie = await getMovieDetails(params.id);

  if (!movie) {
    notFound();
  }

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
              {movie.duration > 0 && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{movie.duration} min</span>
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
                <Button asChild size="lg">
                    <Link href={`/watch/${movie.id}`}>
                        <PlayCircle className="mr-2 h-6 w-6" />
                        Watch Now
                    </Link>
                </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Trailer</h2>
            <TrailerPlayer posterUrl={movie.backdropUrl!} trailerUrl={movie.trailerUrl} />
        </div>

        <Suspense fallback={null}>
            <SimilarMedia mediaId={movie.id} mediaType="movie" />
        </Suspense>
      </div>
    </div>
  );
}
