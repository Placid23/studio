
import { deezerGet } from '@/lib/deezer';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BackButton } from '@/components/layout/BackButton';
import type { Track } from '@/lib/types';
import { searchYoutubeVideo } from '../../actions';
import { TrailerPlayer } from '@/components/media/TrailerPlayer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Music, PlayCircle } from 'lucide-react';
import { SimilarSongs } from '@/components/media/SimilarSongs';
import { createClient } from '@/lib/supabase/server';

async function getTrackDetails(id: string): Promise<{ track: Track, youtubeId: string | null, fileId: string | null }> {
    const trackData = await deezerGet(`track/${id}`);
    if (trackData.error) {
        return notFound();
    }
    const track: Track = trackData;
    
    const youtubeId = await searchYoutubeVideo(`${track.title} ${track.artist.name} official music video`);

    let fileId: string | null = null;
    try {
        const supabase = createClient();
         const { data: likedSongData } = await supabase
            .from('liked_songs')
            .select('file_id')
            .eq('id', track.id)
            .single();
        if (likedSongData && likedSongData.file_id) {
            fileId = likedSongData.file_id;
        }
    } catch(e) {
        // Ignore error if song is not in library, which is expected.
        // The .single() method throws if no row is found.
    }

    return { track, youtubeId, fileId };
}

export default async function TrackDetailPage({ params }: { params: { id: string }}) {
    const { track, youtubeId, fileId } = await getTrackDetails(params.id);

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <div className="flex flex-col md:flex-row gap-8 mt-4">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="img-container rounded-lg shadow-2xl aspect-square relative">
                        <Image 
                            src={track.album.cover_xl} 
                            alt={`Cover for ${track.album.title}`} 
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="rounded-lg object-cover"
                        />
                    </div>
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4">
                    <p className="text-primary font-semibold">Track</p>
                    <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-wide">{track.title}</h1>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="text-xl font-bold">{track.artist.name}</span>
                    </div>
                    <p className="text-muted-foreground mt-2">From the album: <Link href={`/music/album/${track.album.id}`} className="hover:underline text-foreground">{track.album.title}</Link></p>
                    {fileId && (
                         <Button asChild size="lg" className="mt-8">
                            <Link href={`/watch/${track.id}?type=music`}>
                                <PlayCircle className="mr-2 h-6 w-6" />
                                Play Full Song
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider flex items-center gap-3">
                    <Music className="w-8 h-8"/>
                    Music Video
                </h2>
                <TrailerPlayer posterUrl={track.album.cover_xl} trailerUrl={youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : undefined} />
            </div>

            <div className="mt-12">
                <SimilarSongs track={track} />
            </div>
        </div>
    )
}
