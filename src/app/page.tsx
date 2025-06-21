import { MediaCarousel } from '@/components/media/MediaCarousel';
import { Button } from '@/components/ui/button';
import { PlayCircle, Info, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getTrendingMovies, getMoviesByGenre } from '@/lib/tmdb';
import { getPopularShows } from '@/lib/tvmaze';

const GENRE_IDS = {
  Action: '28',
  Comedy: '35',
  SciFi: '878',
};

export default async function Home() {
  let trendingMovies, actionMovies, comedyMovies, scifiMovies, popularShows;
  let error: string | null = null;

  try {
    // Fetch all movie data in parallel
    [trendingMovies, actionMovies, comedyMovies, scifiMovies, popularShows] = await Promise.all([
      getTrendingMovies(),
      getMoviesByGenre(GENRE_IDS.Action),
      getMoviesByGenre(GENRE_IDS.Comedy),
      getMoviesByGenre(GENRE_IDS.SciFi),
      getPopularShows(),
    ]);
  } catch (e: any) {
    if (e.message.includes('API key') || e.message.includes('NEXT_PUBLIC_TMDB_API_KEY')) {
      error = 'NEXT_PUBLIC_TMDB_API_KEY is missing or invalid. Please add it to your .env file.';
    } else {
      error = 'Failed to load movies. Please try again later.';
    }
  }

  if (error) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Error Loading Movies</h1>
          <p className="mt-2 text-destructive/80">{error}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Get your free API key from{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              The Movie Database website
            </a>.
          </p>
        </div>
      </div>
    );
  }
  
  const heroMovie = trendingMovies?.[0];

  if (!heroMovie) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">No trending movies found.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full">
        <Image
          src={heroMovie.backdropUrl}
          alt={heroMovie.title}
          fill
          style={{objectFit: "cover"}}
          className="absolute inset-0"
          priority
          data-ai-hint="movie backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-16 text-white">
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-wider text-primary [text-shadow:0_5px_15px_rgba(0,0,0,0.7)]">
            {heroMovie.title}
          </h1>
          <p className="max-w-xs md:max-w-xl mt-2 md:mt-4 text-sm md:text-lg font-medium text-foreground [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
            {heroMovie.synopsis}
          </p>
          <div className="flex gap-4 mt-4">
            <Link href={`/movies/${heroMovie.id}`} passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground">
                <PlayCircle className="mr-2 h-6 w-6" />
                Play
              </Button>
            </Link>
            <Link href={`/movies/${heroMovie.id}`} passHref>
               <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                <Info className="mr-2 h-6 w-6" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 md:gap-16 py-8 lg:py-12 px-4 md:px-16 -mt-16 md:-mt-24 relative z-10">
        <MediaCarousel title="Trending Now" media={trendingMovies?.slice(1) || []} />
        <MediaCarousel title="Popular TV Shows" media={popularShows || []} />
        <MediaCarousel title="Action & Adventure" media={actionMovies || []} />
        <MediaCarousel title="Comedy" media={comedyMovies || []} />
        <MediaCarousel title="Sci-Fi" media={scifiMovies || []} />
      </div>
    </div>
  );
}
