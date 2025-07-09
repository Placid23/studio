
'use client';

import { Button } from '@/components/ui/button';
import { PlayCircle, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ImageLoader } from '@/components/media/ImageLoader';
import { ContinueWatchingCarousel } from '@/components/media/ContinueWatchingCarousel';
import { MediaCarousel } from '@/components/media/MediaCarousel';
import { getTrending, getPopularMovies, getTopRatedMovies, getUpcomingMovies, getPopularShows, getTopRatedShows } from '@/lib/tmdb';
import type { Movie, Show } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function Home() {
  const [trending, setTrending] = useState<(Movie | Show)[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [popularShows, setPopularShows] = useState<Show[]>([]);
  const [topRatedShows, setTopRatedShows] = useState<Show[]>([]);
  const [popularInCountry, setPopularInCountry] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountryCode(): Promise<string | null> {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.log("Geolocation is not supported by your browser");
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
              const data = await response.json();
              resolve(data.countryCode);
            } catch (err) {
              console.error("Failed to fetch country code:", err);
              resolve(null);
            }
          },
          () => {
            console.log("Unable to retrieve your location.");
            resolve(null);
          }
        );
      });
    }

    async function fetchAllMedia() {
      if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
        setError('The TMDB_API_KEY environment variable is not configured.');
        setIsLoading(false);
        return;
      }

      try {
        const countryCode = await fetchCountryCode();

        const [
          trendingData,
          popularMoviesData,
          topRatedMoviesData,
          upcomingMoviesData,
          popularShowsData,
          topRatedShowsData,
          popularInCountryData
        ] = await Promise.all([
          getTrending('movie'),
          getPopularMovies(),
          getTopRatedMovies(),
          getUpcomingMovies(),
          getPopularShows(),
          getTopRatedShows(),
          countryCode ? getPopularMovies(countryCode) : Promise.resolve([])
        ]);

        setTrending(trendingData);
        setPopularMovies(popularMoviesData);
        setTopRatedMovies(topRatedMoviesData);
        setUpcomingMovies(upcomingMoviesData);
        setPopularShows(popularShowsData);
        setTopRatedShows(topRatedShowsData);
        if (popularInCountryData.length > 0) {
          setPopularInCountry(popularInCountryData);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load media. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllMedia();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    // You can replace this with a proper loading skeleton component
    return <div>Loading...</div>;
  }

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
        {popularInCountry.length > 0 && (
          <MediaCarousel title="Popular in Your Country" media={popularInCountry} />
        )}
        <MediaCarousel title="Popular Movies" media={popularMovies} />
        <MediaCarousel title="Top Rated Movies" media={topRatedMovies} />
        <MediaCarousel title="Upcoming Movies" media={upcomingMovies} />
        <MediaCarousel title="Popular TV Shows" media={popularShows} />
        <MediaCarousel title="Top Rated TV Shows" media={topRatedShows} />
      </div>
    </div>
  );
}
