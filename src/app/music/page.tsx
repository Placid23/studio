
import { MusicCarousel } from '@/components/media/MusicCarousel';
import { spotifyGet } from '@/lib/spotify';
import { AlertTriangle, Music } from 'lucide-react';
import { Suspense } from 'react';

function CarouselSkeleton() {
  return (
    <div className="w-full">
        <div className="mb-4 h-8 w-1/3 rounded-md bg-muted animate-pulse" />
        <div className="relative">
            <div className="scrollbar-hide -mx-4 flex space-x-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="w-40 flex-shrink-0 sm:w-48 md:w-56">
                        <div className="aspect-square w-full">
                            <div className="w-full h-full rounded-lg bg-muted animate-pulse" />
                        </div>
                        <div className="h-4 bg-muted animate-pulse mt-2 rounded w-full"></div>
                        <div className="h-3 bg-muted animate-pulse mt-1 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}


async function MusicData() {
    const country = process.env.SPOTIFY_DEFAULT_COUNTRY || 'US';
    let sections: {
        newReleases: any[];
        featuredPlaylists: any[];
        topGlobal: any[];
        recommendations: any[];
    } = {
        newReleases: [],
        featuredPlaylists: [],
        topGlobal: [],
        recommendations: [],
    };
    let error: string | null = null;

    try {
        const [
            newReleasesData,
            featuredPlaylistsData,
            topGlobalPlaylistData,
            recommendationsData
        ] = await Promise.all([
            spotifyGet('browse/new-releases', { country, limit: 20 }).then(d => d.albums.items).catch(() => []),
            spotifyGet('browse/featured-playlists', { country, limit: 12 }).then(d => d.playlists.items).catch(() => []),
            spotifyGet('playlists/37i9dQZEVXbMDoHDwVN2tF').then(d => d.tracks.items.map((i: any) => i.track)).catch(() => []),
            spotifyGet('recommendations', { limit: 20, seed_artists: '4NHQUGzhtTLFvgF5SZesLK' }).then(d => d.tracks).catch(() => []), // Seed artist: Post Malone
        ]);
        
        sections = {
            newReleases: newReleasesData,
            featuredPlaylists: featuredPlaylistsData,
            topGlobal: topGlobalPlaylistData,
            recommendations: recommendationsData
        };

    } catch (e: any) {
        console.error("Failed to fetch music page data:", e);
        error = e.message || 'An unknown error occurred while fetching music data.';
    }

    if (error) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center p-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-destructive">Could Not Fetch Music</h1>
                <p className="mt-2 text-destructive/80">{error}</p>
                <p className="mt-2 text-xs text-muted-foreground">Please ensure your Spotify credentials are set correctly in the .env.local file.</p>
              </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-8">
            <MusicCarousel title="New Releases" items={sections.newReleases} />
            <MusicCarousel title="Featured Playlists" items={sections.featuredPlaylists} />
            <MusicCarousel title="Top 50 - Global" items={sections.topGlobal} />
            <MusicCarousel title="Recommended For You" items={sections.recommendations} />
        </div>
    )
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
      
      <Suspense fallback={
          <div className="flex flex-col gap-8">
              <CarouselSkeleton />
              <CarouselSkeleton />
              <CarouselSkeleton />
              <CarouselSkeleton />
          </div>
      }>
        <MusicData />
      </Suspense>
    </div>
  );
}
