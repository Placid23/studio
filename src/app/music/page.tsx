
import { getNewReleases } from '@/lib/spotify';
import { MusicCarousel } from '@/components/media/MusicCarousel';
import { Music } from 'lucide-react';
import type { SpotifyAlbum } from '@/lib/spotify';
import { AlertTriangle } from 'lucide-react';

function SpotifyError() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center p-4">
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Could Not Fetch New Releases</h1>
        <p className="mt-2 text-destructive/80">Please ensure your Spotify credentials are set correctly in the .env.local file and that your server has access to the Spotify API.</p>
      </div>
    </div>
  )
}

export default async function MusicPage() {
  let newReleases: SpotifyAlbum[] = [];
  let error: string | null = null;

  try {
    newReleases = await getNewReleases();
  } catch (e: any) {
    console.error("Failed to fetch new releases:", e);
    error = e.message;
  }

  if (error) {
    return <SpotifyError />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Music className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">
          Discover Music
        </h1>
      </div>
      
      <MusicCarousel title="New Releases" albums={newReleases} />
    </div>
  );
}
