'use client';

import { PlayCircle } from 'lucide-react';
import { ImageLoader } from './ImageLoader';
import { useState } from 'react';

interface TrailerPlayerProps {
  posterUrl: string;
  trailerUrl?: string;
}

export function TrailerPlayer({ posterUrl, trailerUrl }: TrailerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying && trailerUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={`${trailerUrl}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        ></iframe>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl cursor-pointer group img-container"
      onClick={() => trailerUrl && setIsPlaying(true)}
    >
      <ImageLoader
        src={posterUrl}
        alt="Trailer thumbnail"
        fill
        style={{objectFit: "cover"}}
        className="transition-transform duration-300 group-hover:scale-105"
        sizes="100vw"
        data-ai-hint="movie backdrop"
      />
      <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/60" />
      {trailerUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="h-20 w-20 text-white/80 drop-shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
        </div>
      )}
    </div>
  );
}
