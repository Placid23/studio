import { deezerGet } from '@/lib/deezer';
import { MusicCarousel } from '@/components/media/MusicCarousel';
import { Music } from 'lucide-react';
import { Suspense } from 'react';
import { MediaCarouselSkeleton } from '@/components/media/MediaCarousel';

async function MusicData() {
  const [albumsData, tracksData, artistsData, genresData] = await Promise.all([
    deezerGet('chart/0/albums', { limit: '20' }),
    deezerGet('chart/0/tracks', { limit: '20' }),
    deezerGet('chart/0/artists', { limit: '20' }),
    deezerGet('genre', { limit: '20' }),
  ]);

  return (
    <>
      <MusicCarousel title="Top Albums" items={albumsData?.data || []} seeAllLink="/music/top-albums" />
      <MusicCarousel title="Top Tracks" items={tracksData?.data || []} seeAllLink="/music/top-tracks" />
      <MusicCarousel title="Top Artists" items={artistsData?.data || []} seeAllLink="/music/top-artists" />
      <MusicCarousel title="Genres" items={genresData?.data || []} seeAllLink="/music/genres" />
    </>
  );
}

export default async function MusicPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Music className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">
          Discover Music
        </h1>
      </div>
      <div className="flex flex-col gap-12">
        <Suspense fallback={
          <>
            <MediaCarouselSkeleton />
            <MediaCarouselSkeleton />
            <MediaCarouselSkeleton />
            <MediaCarouselSkeleton />
          </>
        }>
          <MusicData />
        </Suspense>
      </div>
    </div>
  );
}
