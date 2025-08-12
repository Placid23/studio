
'use client';

import { useLikedSongs } from '@/hooks/use-liked-songs';
import { MusicCarousel } from './MusicCarousel';
import type { LikedSong } from '@/lib/types';

interface LikedSongsCarouselProps {
    initialSongs: LikedSong[];
}

export function LikedSongsCarousel({ initialSongs }: LikedSongsCarouselProps) {
  const { likedSongs } = useLikedSongs(initialSongs);

  if (likedSongs.length === 0) {
    return null;
  }

  return <MusicCarousel title="Liked Songs" items={likedSongs} />;
}
