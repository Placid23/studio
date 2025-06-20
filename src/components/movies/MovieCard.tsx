import Link from 'next/link';
import Image from 'next/image';
import type { Movie } from '@/lib/types';
import { Star, PlayCircle } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`} className="group relative block w-full flex-shrink-0">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/50 group-hover:shadow-2xl">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          objectFit="cover"
          className="transition-opacity duration-300 group-hover:opacity-70"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
           <PlayCircle className="h-16 w-16 text-white/80 drop-shadow-lg" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-base font-bold drop-shadow-lg truncate">{movie.title}</h3>
          <div className="flex items-center gap-1 text-xs mt-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
