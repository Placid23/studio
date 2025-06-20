import { getSimilarMovies } from "@/lib/tmdb";
import type { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SimilarMoviesProps {
  movie: Movie;
}

async function SimilarMovies({ movie }: SimilarMoviesProps) {
  const suggestedMovies = await getSimilarMovies(movie.id);

  if (!suggestedMovies || suggestedMovies.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">You Might Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {suggestedMovies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}

function SimilarMoviesSkeleton() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">You Might Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="aspect-[2/3] w-full">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

SimilarMovies.Skeleton = SimilarMoviesSkeleton;

export default SimilarMovies;
