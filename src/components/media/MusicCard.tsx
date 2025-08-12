
'use client';

import { ImageLoader } from './ImageLoader';
import { Button } from '../ui/button';
import { PlayCircle, Download, Music } from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
}

interface MusicCardProps {
  track: Track;
}

export function MusicCard({ track }: MusicCardProps) {
  const handlePlay = () => {
    // In a real app, this would integrate with a global audio player context
    const audio = new Audio(track.audioUrl);
    audio.play();
  };

  return (
    <div className="group relative w-full flex-shrink-0">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-transparent shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-primary/20 group-hover:shadow-2xl img-container">
        <ImageLoader
          src={track.coverUrl}
          alt={`${track.album} cover`}
          fill
          style={{objectFit: "cover"}}
          className="transition-opacity duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          data-ai-hint="album cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
          <Button variant="ghost" size="icon" onClick={handlePlay} className="h-20 w-20">
            <PlayCircle className="h-20 w-20 text-white/90 drop-shadow-lg transform transition-transform group-hover:scale-110" />
          </Button>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-bold truncate">{track.title}</h3>
        <p className="text-sm text-muted-foreground">{track.artist}</p>
      </div>
      <a href={track.audioUrl} download={`${track.artist} - ${track.title}.mp3`}>
        <Button variant="outline" size="sm" className="w-full mt-2">
            <Download className="mr-2 h-4 w-4" />
            Download
        </Button>
      </a>
    </div>
  );
}
