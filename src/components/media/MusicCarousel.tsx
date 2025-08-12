'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SkeletonCard() {
  return (
    <div className="p-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 mt-2 rounded w-full" />
      <Skeleton className="h-3 mt-1 rounded w-2/3" />
    </div>
  );
}

export function MusicCarousel({ title, items = [], seeAllLink }: { title: string; items: any[]; seeAllLink?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<Slider>(null);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 3,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
    ],
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        direction === 'left' ? scrollRef.current.slickPrev() : scrollRef.current.slickNext();
    }
  };

  const playPreview = (url?: string) => {
    if (!url || !audioRef.current) return;
    try {
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
      }
      audioRef.current.play().catch(() => {});
    } catch (e) {
      console.error("Error playing audio preview:", e);
    }
  };

  const stopPreview = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const renderCard = (item: any, idx: number) => {
    let image = '/img/placeholder.png';
    let titleText = '';
    let subtitleText = '';
    let externalLink = '#';
    let previewUrl = null;

    if (item.type === 'album') {
      image = item.cover_xl || item.cover_big || item.cover_medium;
      titleText = item.title;
      subtitleText = item.artist?.name || '';
      externalLink = item.link || item.tracklist || '#';
    } else if (item.type === 'track') {
      image = item.album?.cover_xl || item.album?.cover_big;
      titleText = item.title;
      subtitleText = item.artist?.name || '';
      externalLink = item.link || '#';
      previewUrl = item.preview;
    } else if (item.type === 'artist') {
      image = item.picture_xl || item.picture_big || item.picture_medium;
      titleText = item.name;
      subtitleText = item.nb_fan ? `${item.nb_fan.toLocaleString()} fans` : '';
      externalLink = item.link || '#';
    } else if (item.type === 'genre') {
        image = item.picture_xl || item.picture_big;
        titleText = item.name;
        externalLink = `https://www.deezer.com/genre/${item.id}`;
    }

    return (
      <div key={item.id || idx} className="group relative">
        <div 
          onMouseEnter={() => playPreview(previewUrl)}
          onMouseLeave={stopPreview}
          className="carousel-card bg-card/80 rounded-lg p-3 transition-colors hover:bg-card"
        >
          <a href={externalLink} target="_blank" rel="noreferrer" className="block">
            <div className="w-full aspect-square relative rounded-md overflow-hidden bg-muted/20 img-container">
              <Image src={image || '/img/placeholder.png'} alt={titleText} fill sizes="20vw" style={{ objectFit: 'cover' }} />
              {previewUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-16 h-16 text-white/80" />
                  </div>
              )}
            </div>
            <div className="mt-3 text-center">
              <div className="font-bold text-sm truncate text-foreground">{titleText}</div>
              <div className="text-xs text-muted-foreground truncate">{subtitleText}</div>
            </div>
          </a>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold uppercase tracking-wider text-foreground/80 md:text-2xl lg:text-3xl">
                {title}
            </h2>
            {seeAllLink && (
              <Button asChild variant="link" className="text-primary hover:text-primary/80">
                <Link href={seeAllLink}>See all</Link>
              </Button>
            )}
        </div>

        {items && items.length > 0 ? (
            <div className="relative group/carousel">
                <Slider ref={scrollRef} {...settings}>
                    {items.map((it, i) => renderCard(it, i))}
                </Slider>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-24 w-12 rounded-r-lg rounded-l-none bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm z-20 hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity -ml-4"
                    onClick={() => scroll('left')}
                    >
                    <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-24 w-12 rounded-l-lg rounded-r-none bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm z-20 hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity -mr-4"
                    onClick={() => scroll('right')}
                    >
                    <ChevronRight className="h-8 w-8" />
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        )}

      <audio ref={audioRef} />
    </section>
  );
}