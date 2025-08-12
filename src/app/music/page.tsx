
import { getFeaturedPlaylists, getArtistTopTracks, getPlaylistTracks, SpotifyTrack, getArtistId } from '@/lib/spotify';
import { Music, PlusCircle, AlertTriangle } from 'lucide-react';
import { MusicCarousel } from '@/components/media/MusicCarousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ImageLoader } from '@/components/media/ImageLoader';
import type { SearchedTrack } from '@/lib/musicbrainz';

function SpotifyError() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Spotify API Error</h1>
        <p className="mt-2 text-destructive/80">Could not connect to Spotify. Please ensure your credentials are set correctly in the .env file.</p>
      </div>
    </div>
  )
}

function mapSpotifyTrackToSearchedTrack(track: SpotifyTrack): SearchedTrack {
    return {
        mbid: track.id,
        title: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album.name,
        coverUrl: track.album.images[0]?.url,
    };
}


async function MusicPage() {
    let featuredPlaylists, drakeTracks, mercyChinwoTracks, heroPlaylist;

    try {
        [
            featuredPlaylists,
            drakeTracks,
            mercyChinwoTracks
        ] = await Promise.all([
            getFeaturedPlaylists(),
            getArtistId('Drake').then(id => id ? getArtistTopTracks(id) : []),
            getArtistId('Mercy Chinwo').then(id => id ? getArtistTopTracks(id) : [])
        ]);

        if (featuredPlaylists.length > 0) {
            const tracks = await getPlaylistTracks(featuredPlaylists[0].id);
            heroPlaylist = {
                ...featuredPlaylists[0],
                tracks: tracks.slice(0, 5)
            };
        }

    } catch (e) {
        console.error("Failed to fetch music from Spotify:", e);
        return <SpotifyError />;
    }

    if (!featuredPlaylists || featuredPlaylists.length === 0) {
        return <SpotifyError />;
    }

  return (
    <div className="animate-in fade-in-50 duration-500">
        {heroPlaylist && (
            <div className="relative h-[50vh] md:h-[60vh] w-full img-container">
                <ImageLoader
                src={heroPlaylist.images[0].url}
                alt={`Backdrop for ${heroPlaylist.name}`}
                fill
                style={{ objectFit: 'cover' }}
                className="opacity-50"
                priority
                data-ai-hint="playlist cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="container mx-auto absolute bottom-[10%] left-4 md:left-16 text-white">
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-wider text-primary [text-shadow:0_5px_15px_rgba(0,0,0,0.7)]">
                        {heroPlaylist.name}
                    </h1>
                    <p className="max-w-xs md:max-w-2xl mt-2 md:mt-4 text-sm md:text-lg font-medium [text-shadow:0_2px_6px_rgba(0,0,0,0.8)] line-clamp-3">
                        {heroPlaylist.description}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                        {heroPlaylist.tracks.map((track:any) => (
                             <div key={track.track.id} className="flex items-center gap-2 p-2 rounded-md bg-black/20 backdrop-blur-sm max-w-sm">
                                <ImageLoader src={track.track.album.images[0].url} alt={track.track.name} width={40} height={40} className="rounded-sm" data-ai-hint="album art" />
                                <div>
                                    <p className="font-bold text-sm">{track.track.name}</p>
                                    <p className="text-xs text-white/70">{track.track.artists[0].name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <div className="flex flex-col gap-12 md:gap-16 py-8 lg:py-12 px-4 md:px-16 -mt-16 relative z-10">
            <MusicCarousel title="Featured Playlists" items={featuredPlaylists.map(p => ({
                id: p.id,
                type: 'playlist',
                title: p.name,
                artist: p.owner.display_name,
                coverUrl: p.images[0]?.url,
            }))} />

            {drakeTracks.length > 0 && <MusicCarousel title="More from Drake" items={drakeTracks.map(mapSpotifyTrackToSearchedTrack)} />}
            {mercyChinwoTracks.length > 0 && <MusicCarousel title="More from Mercy Chinwo" items={mercyChinwoTracks.map(mapSpotifyTrackToSearchedTrack)} />}

            <div className="flex justify-center mt-8">
                 <Button asChild size="lg">
                    <Link href="/music/search">
                        <PlusCircle className="mr-2" />
                        Browse All New Releases
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}

export default MusicPage;
