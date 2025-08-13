
'use client';

import type { Movie, Show } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { ImageLoader } from '@/components/media/ImageLoader';

interface HomePageClientProps {
  heroMedia: Movie | Show;
  children: React.ReactNode;
}

export function HomePageClient({ heroMedia, children }: HomePageClientProps) {
  let heroLink = '';
  switch (heroMedia.type) {
    case 'movie':
      heroLink = `/movies/${heroMedia.tmdbId}`;
      break;
    case 'tv':
      heroLink = `/shows/${heroMedia.tmdbId}`;
      break;
    case 'anime':
      heroLink = `/anime/${heroMedia.tmdbId}`;
      break;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full img-container">
        <ImageLoader
          src={heroMedia.backdropUrl!}
          alt={heroMedia.title}
          fill
          style={{objectFit: "cover"}}
          className="absolute inset-0"
          priority
          data-ai-hint="movie backdrop"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-16 text-white">
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-wider text-primary [text-shadow:0_5px_15px_rgba(0,0,0,0.7)]">
            {heroMedia.title}
          </h1>
          <p className="max-w-xs md:max-w-xl mt-2 md:mt-4 text-sm md:text-lg font-medium [text-shadow:0_2px_6px_rgba(0,0,0,0.8)] line-clamp-3">
            {heroMedia.synopsis}
          </p>
          <div className="flex gap-4 mt-4">
            <Link href={heroLink} passHref>
               <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                <Info className="mr-2 h-6 w-6" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
