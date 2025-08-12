
import { deezerGet } from '@/lib/deezer';
import { MusicCarousel } from '@/components/media/MusicCarousel';
import { Music } from 'lucide-react';
import { Suspense } from 'react';
import { MediaCarouselSkeleton } from '@/components/media/MediaCarousel';
import { LikedSongsCarousel } from '@/components/media/LikedSongsCarousel';
import { getLikedSongsAction } from './actions';
import { createClient } from '@/lib/supabase/server';

async function MusicData() {
    const [albumsData, tracksData, artistsData, genresData] = await Promise.all([
      deezerGet('chart/0/albums', { limit: '20' }),
      deezerGet('chart/0/tracks', { limit: '20' }),
      deezerGet('chart/0/artists', { limit: '20' }),
      deezerGet('genre', { limit: '20' }),
    ]);

    const musicData = {
      albums: albumsData?.data || [],
      tracks: tracksData?.data || [],
      artists: artistsData?.data || [],
      genres: genresData?.data || [],
    };

    return (
        <>
            <MusicCarousel title="Top Albums" items={musicData.albums} seeAllLink="/music/top-albums" />
            <MusicCarousel title="Top Tracks" items={musicData.tracks} seeAllLink="/music/top-tracks" />
            <MusicCarousel title="Top Artists" items={musicData.artists} seeAllLink="/music/top-artists" />
            <MusicCarousel title="Genres" items={musicData.genres} seeAllLink="/music/genres" />
        </>
    )
}

export default async function MusicPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch initial liked songs on the server for faster initial load
    const initialLikedSongs = user ? await getLikedSongsAction() : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Music className="w-10 h-10 text-primary" />
                <h1 className="text-4xl font-black text-primary uppercase tracking-wider">
                    Discover Music
                </h1>
            </div>
            <div className="flex flex-col gap-12">
                {user && <LikedSongsCarousel initialSongs={initialLikedSongs} />}
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
