
import { deezerGet } from '@/lib/deezer';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BackButton } from '@/components/layout/BackButton';
import { Badge } from '@/components/ui/badge';
import type { Artist, Track } from '@/lib/types';
import { AudioPlayer } from '@/components/media/AudioPlayer';

async function getArtistDetails(id: string): Promise<{ artist: Artist, topTracks: Track[] } | null> {
    try {
        const [artistData, topTracksData] = await Promise.all([
            deezerGet(`artist/${id}`),
            deezerGet(`artist/${id}/top`, { limit: '20' })
        ]);
        
        if (artistData.error || topTracksData.error) {
            return null;
        }
        
        return {
            artist: artistData,
            topTracks: topTracksData.data || []
        };
    } catch (e) {
        console.error(`Failed to fetch artist ${id}`, e);
        return null;
    }
}

export default async function ArtistDetailPage({ params }: { params: { id: string }}) {
    const data = await getArtistDetails(params.id);

    if (!data) {
        notFound();
    }

    const { artist, topTracks } = data;
    
    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden mt-4">
                <Image 
                    src={artist.picture_xl} 
                    alt={`Banner for ${artist.name}`} 
                    fill
                    sizes="100vw"
                    className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                     <Badge variant="secondary" className="mb-2">Artist</Badge>
                     <h1 className="text-4xl md:text-7xl font-black text-primary uppercase tracking-wide">{artist.name}</h1>
                     <p className="text-muted-foreground mt-2">{artist.nb_fan.toLocaleString()} fans</p>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Top Tracks</h2>
                <AudioPlayer tracks={topTracks} />
            </div>
        </div>
    )
}
