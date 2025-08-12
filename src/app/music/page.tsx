
'use client';

import { deezerGet } from '@/lib/deezer';
import { MusicCarousel } from '@/components/media/MusicCarousel';
import { Music } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { MediaCarouselSkeleton } from '@/components/media/MediaCarousel';
import type { Album, Artist, Track } from '@/lib/types';
import { useLikedSongs } from '@/hooks/use-liked-songs';

interface MusicData {
  albums: Album[];
  tracks: Track[];
  artists: Artist[];
  genres: any[];
}

function LikedSongsCarousel() {
  const { likedSongs } = useLikedSongs();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || likedSongs.length === 0) {
    return null;
  }

  return <MusicCarousel title="Liked Songs" items={likedSongs} />;
}

export default function MusicPage() {
  const [musicData, setMusicData] = useState<MusicData | null>(null);

  useEffect(() => {
    async function fetchMusicData() {
      const [albumsData, tracksData, artistsData, genresData] = await Promise.all([
        deezerGet('chart/0/albums', { limit: '20' }),
        deezerGet('chart/0/tracks', { limit: '20' }),
        deezerGet('chart/0/artists', { limit: '20' }),
        deezerGet('genre', { limit: '20' }),
      ]);
      setMusicData({
        albums: albumsData?.data || [],
        tracks: tracksData?.data || [],
        artists: artistsData?.data || [],
        genres: genresData?.data || [],
      });
    }
    fetchMusicData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Music className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">
          Discover Music
        </h1>
      </div>
      <div className="flex flex-col gap-12">
        <LikedSongsCarousel />
        <Suspense fallback={
          <>
            <MediaCarouselSkeleton />
            <MediaCarouselSkeleton />
            <MediaCarouselSkeleton />
            <MediaCarouselSkeleton />
          </>
        }>
          {musicData ? (
            <>
              <MusicCarousel title="Top Albums" items={musicData.albums} seeAllLink="/music/top-albums" />
              <MusicCarousel title="Top Tracks" items={musicData.tracks} seeAllLink="/music/top-tracks" />
              <MusicCarousel title="Top Artists" items={musicData.artists} seeAllLink="/music/top-artists" />
              <MusicCarousel title="Genres" items={musicData.genres} seeAllLink="/music/genres" />
            </>
          ) : (
             <>
              <MediaCarouselSkeleton />
              <MediaCarouselSkeleton />
              <MediaCarouselSkeleton />
              <MediaCarouselSkeleton />
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
}
