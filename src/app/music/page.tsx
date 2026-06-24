import { deezerGet } from '@/lib/deezer';
import { MusicCarousel } from '@/components/media/MusicCarousel';
import { Music, Headphones, Sparkles, User, Album as AlbumIcon, Mic2 } from 'lucide-react';
import { Suspense } from 'react';
import { MediaCarouselSkeleton } from '@/components/media/MediaCarousel';
import { LikedSongsCarousel } from '@/components/media/LikedSongsCarousel';
import { getLikedSongsAction } from './actions';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { MusicSearch } from '@/components/media/MusicSearch';
import Image from 'next/image';
import Link from 'next/link';

async function TopArtistsGrid() {
    const artistsData = await deezerGet('chart/0/artists', { limit: '8' });
    const artists = artistsData?.data || [];
    
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 mt-6">
            {artists.map((artist: any) => (
                <Link key={artist.id} href={`/music/artist/${artist.id}`} className="group text-center space-y-3">
                    <div className="relative aspect-square rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all duration-300 shadow-xl">
                        <Image src={artist.picture_xl} alt={artist.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-tighter truncate group-hover:text-primary">{artist.name}</p>
                </Link>
            ))}
        </div>
    );
}

async function MusicData() {
    const [albumsData, tracksData, genresData] = await Promise.all([
      deezerGet('chart/0/albums', { limit: '20' }),
      deezerGet('chart/0/tracks', { limit: '20' }),
      deezerGet('genre', { limit: '12' }),
    ]);

    const musicData = {
      albums: albumsData?.data || [],
      tracks: tracksData?.data || [],
      genres: genresData?.data?.filter((g: any) => g.name !== 'All') || [],
    };

    return (
        <div className="space-y-20">
            <MusicCarousel title="Today's Trending Tracks" items={musicData.tracks} seeAllLink="/music/top-tracks" />
            
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <Mic2 className="w-6 h-6 text-primary" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">World Class Artists</h2>
                </div>
                <TopArtistsGrid />
            </section>

            <MusicCarousel title="Chart-Topping Albums" items={musicData.albums} seeAllLink="/music/top-albums" />

            <section>
                <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Vibe by Genre</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {musicData.genres.map((genre: any) => (
                        <a 
                            key={genre.id} 
                            href={`https://www.deezer.com/genre/${genre.id}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="group relative h-24 rounded-2xl overflow-hidden border border-border hover:border-primary transition-all"
                        >
                            <Image src={genre.picture_xl} alt={genre.name} fill className="object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white font-black uppercase tracking-widest text-[10px]">{genre.name}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default async function MusicPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    
    let user = null;
    if (token) {
        try {
            user = await adminAuth.verifyIdToken(token);
        } catch (e) {
            user = null;
        }
    }

    const initialLikedSongs = user ? await getLikedSongsAction() : [];

    return (
        <div className="container mx-auto px-4 py-16">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-primary">
                        <Headphones className="w-10 h-10" />
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
                            Discover
                        </h1>
                    </div>
                    <div className="h-1.5 w-32 bg-primary rounded-full shadow-[0_0_20px_rgba(225,29,72,0.4)]"></div>
                </div>
                <div className="flex-1 max-w-xl">
                    <MusicSearch />
                </div>
            </header>

            <div className="flex flex-col gap-20">
                {user && <LikedSongsCarousel initialSongs={initialLikedSongs} />}
                
                <Suspense fallback={
                    <div className="space-y-20">
                        <MediaCarouselSkeleton />
                        <div className="h-40 bg-muted/20 rounded-[2.5rem] animate-pulse" />
                        <MediaCarouselSkeleton />
                    </div>
                }>
                    <MusicData />
                </Suspense>
            </div>
        </div>
    );
}
