import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

interface TrailerPlayerProps {
  posterUrl: string;
}

export function TrailerPlayer({ posterUrl }: TrailerPlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl cursor-pointer group">
      <Image
        src={posterUrl}
        alt="Trailer thumbnail"
        fill
        style={{objectFit: "cover"}}
        className="transition-transform duration-300 group-hover:scale-105"
        sizes="100vw"
        data-ai-hint="movie backdrop"
      />
      <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayCircle className="h-20 w-20 text-white/80 drop-shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
      </div>
    </div>
  );
}
