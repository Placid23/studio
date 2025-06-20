import { suggestSimilarMovies } from "@/ai/flows/suggest-similar-movies";
import type { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SimilarMoviesProps {
  movie: Movie;
}

async function SimilarMovies({ movie }: SimilarMoviesProps) {
  const suggestions = await suggestSimilarMovies({
    title: movie.title,
    genre: movie.genres.join(", "),
    cast: movie.cast.join(", "),
    director: movie.director,
    synopsis: movie.synopsis,
  });

  const suggestedMovies: Movie[] = suggestions.suggestions.map((s, index) => ({
    id: `${movie.id}-suggestion-${index}`,
    title: s.title,
    year: new Date().getFullYear(),
    duration: 120,
    genres: s.genre.split(',').map(g => g.trim()),
    rating: Math.round((Math.random() * (9 - 7) + 7) * 10) / 10, // Random rating between 7.0 and 9.0
    synopsis: s.synopsis,
    cast: s.cast.split(',').map(c => c.trim()),
    director: s.director,
    posterUrl: `https://placehold.co/500x750.png`,
    backdropUrl: `https://placehold.co/1920x1080.png`,
  }));

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
