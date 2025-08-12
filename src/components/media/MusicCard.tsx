
'use client';

import { ImageLoader } from './ImageLoader';
import type { SpotifyAlbum } from '@/lib/spotify';
import Link from 'next/link';

interface MusicCardProps {
  album: SpotifyAlbum;
}

export function MusicCard({ album }: MusicCardProps) {

  return (
    <Link 
        href={album.external_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-full flex-shrink-0"
        title={`${album.name} by ${album.artists[0].name}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-transparent shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl img-container">
        <ImageLoader
          src={album.images[0].url}
          alt={`${album.name} album cover`}
          fill
          style={{objectFit: "cover"}}
          className="transition-opacity duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          data-ai-hint="album cover"
        />
      </div>
      <div className="mt-2 text-left">
        <h3 className="text-sm font-bold truncate">{album.name}</h3>
        <p className="text-xs text-muted-foreground truncate">{album.artists.map(a => a.name).join(', ')}</p>
      </div>
    </Link>
  );
}
