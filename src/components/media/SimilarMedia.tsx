import { getSimilarMovies } from "@/lib/tmdb";
import type { Movie } from "@/lib/types";
import { MediaCard } from "./MediaCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SimilarMediaProps {
  media: Movie;
}

async function SimilarMedia({ media }: SimilarMediaProps) {
  // Currently only supports finding similar movies.
  if (media.type !== 'movie') {
    return null;
  }
  
  const suggestedMovies = await getSimilarMovies(media.id);

  if (!suggestedMovies || suggestedMovies.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">You Might Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {suggestedMovies.map((m) => (
          <MediaCard key={m.id} media={m} />
        ))}
      </div>
    </div>
  );
}

function SimilarMediaSkeleton() {
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

SimilarMedia.Skeleton = SimilarMediaSkeleton;

export { SimilarMedia };
