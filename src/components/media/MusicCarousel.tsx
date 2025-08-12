
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import { Play } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="p-2">
      <div className="bg-muted animate-pulse rounded-lg aspect-square w-full"></div>
      <div className="h-4 bg-muted animate-pulse mt-2 rounded"></div>
      <div className="h-3 bg-muted animate-pulse mt-1 rounded w-2/3"></div>
    </div>
  );
}

export function MusicCarousel({ title, items = [] }: { title: string, items: any[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentlyPlaying = useRef<string | null>(null);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 3,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5, slidesToScroll: 2 } },
      { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ]
  };

  const playPreview = (url: string | null) => {
    if (!url || !audioRef.current) return;
    
    if (currentlyPlaying.current === url) {
        audioRef.current.pause();
        currentlyPlaying.current = null;
    } else {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
        currentlyPlaying.current = url;
    }
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const renderItem = (item: any, idx: number) => {
    // Normalize common shapes: album item, playlist item, track item
    let imageUrl = item.images?.[0]?.url || item.album?.images?.[0]?.url;
    let name = item.name || item.track?.name || item.album?.name;
    let subtitle = item.artists?.map((a: any) => a.name).join(', ') || item.track?.artists?.map((a: any) => a.name).join(', ') || item.owner?.display_name || '';
    let externalUrl = item.external_urls?.spotify || item.track?.external_urls?.spotify || '#';
    let previewUrl = item.preview_url || item.track?.preview_url || null;

    if (!imageUrl) imageUrl = 'https://placehold.co/300x300.png';

    return (
      <div
        key={`${item.id}-${idx}`}
        className="p-2 group/card"
        onMouseLeave={stopPreview}
      >
        <div className="block carousel-card bg-card/60 rounded-lg p-3">
          <a href={externalUrl} target="_blank" rel="noreferrer" className="block relative aspect-square w-full rounded-md overflow-hidden bg-muted">
            <Image 
                src={imageUrl} 
                alt={name} 
                fill 
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw" 
                className="object-cover transition-transform duration-300 group-hover/card:scale-110" 
                data-ai-hint="album cover music"
            />
             {previewUrl && (
                <div 
                    className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity cursor-pointer"
                    onClick={(e) => {
                        e.preventDefault();
                        playPreview(previewUrl);
                    }}
                >
                    <Play className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
            )}
          </a>
          <div className="mt-2">
            <a href={externalUrl} target="_blank" rel="noreferrer" className="font-semibold text-sm truncate block hover:underline" title={name}>{name}</a>
            {subtitle && <p className="text-xs text-muted-foreground truncate" title={subtitle}>{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  if (!items || items.length === 0) {
      return (
        <section className="mb-8">
            <h3 className="text-xl font-bold mb-3">{title}</h3>
             <div className="flex">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        </section>
      );
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold">{title}</h3>
      </div>

      <Slider {...settings}>
          {items.map((it, i) => renderItem(it, i))}
      </Slider>

      <audio ref={audioRef} onEnded={() => currentlyPlaying.current = null} />
    </section>
  );
}
