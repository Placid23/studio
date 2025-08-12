
import { getMusicTracks, getSignedUrl } from './actions';
import { Music, PlusCircle } from 'lucide-react';
import { MusicTrackList } from '@/components/media/MusicTrackList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const revalidate = 0;

async function MusicPage() {
  const tracks = await getMusicTracks();

  if (!tracks || tracks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center h-[calc(100vh-8rem)]">
        <Music className="w-16 h-16 text-primary" />
        <h1 className="mt-6 text-4xl font-black uppercase tracking-wider">
          No Music Found
        </h1>
        <p className="mt-2 text-muted-foreground">
          There are currently no tracks in the library.
        </p>
         <Button asChild className="mt-6">
            <Link href="/music/search">
                <PlusCircle className="mr-2" />
                Search & Add Music
            </Link>
        </Button>
      </div>
    );
  }

  // Pre-sign all the URLs on the server
  const signedTracks = await Promise.all(
    tracks.map(async (track) => {
      const { signedUrl, error } = await getSignedUrl(track.file_id);
      if (error) {
        console.error(`Failed to sign URL for track ${track.id}: ${error}`);
        return { ...track, audioUrl: '', cover_url: track.cover_url || 'https://placehold.co/128x128.png' };
      }
      return { ...track, audioUrl: signedUrl, cover_url: track.cover_url || 'https://placehold.co/128x128.png' };
    })
  );


  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between gap-4 text-primary mb-8">
        <div className="flex items-center gap-4">
            <Music className="w-12 h-12" />
            <h1 className="text-4xl font-black uppercase tracking-wider">
            Music Library
            </h1>
        </div>
        <Button asChild>
            <Link href="/music/search">
                <PlusCircle className="mr-2" />
                Search & Add Music
            </Link>
        </Button>
      </div>
      <MusicTrackList tracks={signedTracks} />
    </div>
  );
}

export default MusicPage;
