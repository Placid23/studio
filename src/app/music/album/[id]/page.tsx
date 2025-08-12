
import { deezerGet } from '@/lib/deezer';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BackButton } from '@/components/layout/BackButton';
import { Badge } from '@/components/ui/badge';
import type { Album } from '@/lib/types';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { AudioPlayer } from '@/components/media/AudioPlayer';

async function getAlbumDetails(id: string): Promise<Album | null> {
    try {
        const albumData = await deezerGet(`album/${id}`);
        if (albumData.error) {
            return null;
        }
        return albumData;
    } catch (e) {
        console.error(`Failed to fetch album ${id}`, e);
        return null;
    }
}

export default async function AlbumDetailPage({ params }: { params: { id: string }}) {
    const album = await getAlbumDetails(params.id);

    if (!album) {
        notFound();
    }

    const releaseYear = album.release_date ? format(new Date(album.release_date), 'yyyy') : 'N/A';
    
    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <div className="flex flex-col md:flex-row gap-8 mt-4">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="img-container rounded-lg shadow-2xl aspect-square relative">
                        <Image 
                            src={album.cover_xl} 
                            alt={`Cover for ${album.title}`} 
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="rounded-lg object-cover"
                        />
                    </div>
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4">
                    <Badge variant="secondary" className="mb-2">Album</Badge>
                    <h1 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-wide">{album.title}</h1>
                    <div className="flex items-center gap-4 mt-4">
                        <Image src={album.artist.picture_xl} alt={album.artist.name} width={40} height={40} className="rounded-full" />
                        <span className="text-xl font-bold">{album.artist.name}</span>
                    </div>
                    <p className="text-muted-foreground mt-2">{releaseYear} &bull; {album.tracks.data.length} tracks</p>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Tracks</h2>
                <AudioPlayer tracks={album.tracks.data} />
            </div>
        </div>
    )
}
