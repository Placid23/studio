import { MovieCard } from './MovieCard';
import type { Movie } from '@/lib/types';

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="mb-4 text-xl font-bold uppercase tracking-wider text-foreground md:text-2xl">
        {title}
      </h2>
      <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {movies.map((movie) => (
          <div key={movie.id} className="w-40 flex-shrink-0 sm:w-48 md:w-56">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
