import { MovieCarousel } from '@/components/movies/MovieCarousel';
import { MOVIES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlayCircle, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const trendingMovies = MOVIES.slice(0, 10);
  const actionMovies = MOVIES.filter(m => m.genres.includes('Action')).slice(0, 10);
  const comedyMovies = MOVIES.filter(m => m.genres.includes('Comedy')).slice(0, 10);
  const scifiMovies = MOVIES.filter(m => m.genres.includes('Sci-Fi')).slice(0, 10);
  const heroMovie = MOVIES[0];

  return (
    <div className="flex flex-col">
      <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full">
        <Image
          src={heroMovie.backdropUrl}
          alt={heroMovie.title}
          fill
          objectFit="cover"
          className="absolute inset-0"
          priority
          data-ai-hint="movie backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-16 text-white">
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-wider text-primary [text-shadow:0_4px_8px_rgba(0,0,0,0.8)]">
            {heroMovie.title}
          </h1>
          <p className="max-w-xs md:max-w-xl mt-2 md:mt-4 text-sm md:text-lg font-medium text-foreground [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">
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
               <Button size="lg" variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <Info className="mr-2 h-6 w-6" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:gap-12 py-8 lg:py-12 px-4 md:px-16 -mt-16 md:-mt-24 relative z-10">
        <MovieCarousel title="Trending Now" movies={trendingMovies} />
        <MovieCarousel title="Action & Adventure" movies={actionMovies} />
        <MovieCarousel title="Comedy" movies={comedyMovies} />
        <MovieCarousel title="Sci-Fi" movies={scifiMovies} />
      </div>
    </div>
  );
}
