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
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border-2 border-transparent shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-primary/20 group-hover:shadow-2xl">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          style={{objectFit: "cover"}}
          className="transition-opacity duration-300"
          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
           <PlayCircle className="h-20 w-20 text-white/90 drop-shadow-lg transform transition-transform group-hover:scale-110" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/80 to-transparent">
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
