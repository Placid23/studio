
import { Button } from '@/components/ui/button';
import { PlayCircle, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ImageLoader } from '@/components/media/ImageLoader';
import { ContinueWatchingCarousel } from '@/components/media/ContinueWatchingCarousel';
import { MediaCarousel } from '@/components/media/MediaCarousel';
import { getTrending, getPopularMovies, getTopRatedMovies, getUpcomingMovies, getPopularShows, getTopRatedShows } from '@/lib/tmdb';

export const dynamic = 'force-dynamic';

export default async function Home() {
  if (!process.env.TMDB_API_KEY) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive">TMDB API Key Missing</h1>
          <p className="mt-2 text-destructive/80">The TMDB_API_KEY environment variable is not configured.</p>
        </div>
      </div>
    );
  }

  const [
    trending,
    popularMovies,
    topRatedMovies,
    upcomingMovies,
    popularShows,
    topRatedShows
  ] = await Promise.all([
    getTrending('movie'),
    getPopularMovies(),
    getTopRatedMovies(),
    getUpcomingMovies(),
    getPopularShows(),
    getTopRatedShows()
  ]);

  const heroMedia = trending.length > 0 ? trending[Math.floor(Math.random() * Math.min(trending.length, 10))] : null;

  if (!heroMedia) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-bold">Could not load trending media.</h1>
        <p className="text-muted-foreground">Please check your TMDB API key and try again.</p>
      </div>
    );
  }

  const heroLink = heroMedia.type === 'movie' ? `/movies/${heroMedia.id}` : `/shows/${heroMedia.id}`;

  return (
    <div className="flex flex-col">
      <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full img-container">
        <ImageLoader
          src={heroMedia.backdropUrl!}
          alt={heroMedia.title}
          fill
          style={{objectFit: "cover"}}
          className="absolute inset-0"
          priority
          data-ai-hint="movie backdrop"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-16 text-white">
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-wider text-primary [text-shadow:0_5px_15px_rgba(0,0,0,0.7)]">
            {heroMedia.title}
          </h1>
          <p className="max-w-xs md:max-w-xl mt-2 md:mt-4 text-sm md:text-lg font-medium [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
            {heroMedia.synopsis}
          </p>
          <div className="flex gap-4 mt-4">
            <Link href={heroLink} passHref>
               <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                <Info className="mr-2 h-6 w-6" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 md:gap-16 py-8 lg:py-12 px-4 md:px-16 -mt-16 md:-mt-24 relative z-10">
        <ContinueWatchingCarousel />
        <MediaCarousel title="Popular Movies" media={popularMovies} />
        <MediaCarousel title="Top Rated Movies" media={topRatedMovies} />
        <MediaCarousel title="Upcoming Movies" media={upcomingMovies} />
        <MediaCarousel title="Popular TV Shows" media={popularShows} />
        <MediaCarousel title="Top Rated TV Shows" media={topRatedShows} />
      </div>
    </div>
  );
}
