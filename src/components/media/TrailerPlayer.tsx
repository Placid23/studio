'use client';

import { PlayCircle, VideoOff } from 'lucide-react';
import { ImageLoader } from './ImageLoader';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg shadow-xl group img-container",
        trailerUrl && "cursor-pointer"
      )}
      onClick={() => trailerUrl && setIsPlaying(true)}
    >
      <ImageLoader
        src={posterUrl}
        alt="Trailer thumbnail"
        fill
        style={{objectFit: "cover"}}
        className={cn(trailerUrl && "transition-transform duration-300 group-hover:scale-105")}
        sizes="100vw"
        data-ai-hint="movie backdrop"
      />
      <div className={cn(
        "absolute inset-0 bg-black/40",
        trailerUrl && "transition-colors group-hover:bg-black/60"
      )} />
      
      {trailerUrl ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="h-20 w-20 text-white/80 drop-shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
            <VideoOff className="h-16 w-16 text-muted-foreground/70 mb-2" />
            <p className="font-bold text-lg text-foreground">Trailer Not Available</p>
            <p className="text-sm text-muted-foreground">We couldn't find a trailer for this title.</p>
        </div>
      )}
    </div>
  );
}
