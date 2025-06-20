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
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-lg transition-transform duration-300 group-hover:scale-105">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          layout="fill"
          objectFit="cover"
          className="transition-opacity duration-300 group-hover:opacity-80"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
           <PlayCircle className="h-16 w-16 text-white/80" />
        </div>
        <div className="absolute bottom-2 left-2 text-white">
          <h3 className="text-base font-bold drop-shadow-lg">{movie.title}</h3>
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
