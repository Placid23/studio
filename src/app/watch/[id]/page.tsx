
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/layout/BackButton';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { AlertTriangle } from 'lucide-react';

async function getStreamInfo(tmdbId: string, season?: string, episode?: string): Promise<{ fileId: string | null; error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { fileId: null, error: 'Supabase environment variables are not configured.' };
  }

  try {
    const supabase = createClient();
    
    if (season && episode) {
        // This is a TV Show episode
        const { data, error } = await supabase
            .from('tv_episodes')
            .select('file_id')
            .eq('tmdb_id', parseInt(tmdbId))
            .eq('season', parseInt(season))
            .eq('episode', parseInt(episode))
            .maybeSingle();
        
        if (error) {
            console.error('Supabase error fetching episode file_id:', error.message);
            return { fileId: null, error: `Could not fetch streaming info for episode: ${error.message}` };
        }
        return { fileId: data?.file_id || null };

    } else {
        // This is a Movie
        const { data, error } = await supabase
            .from('movies')
            .select('file_id')
            .eq('tmdb_id', parseInt(tmdbId))
            .maybeSingle();

        if (error) {
            console.error('Supabase error fetching movie file_id:', error.message);
            return { fileId: null, error: `Could not fetch streaming info for movie: ${error.message}` };
        }
        return { fileId: data?.file_id || null };
    }

  } catch (err: any) {
    console.error('Unexpected error fetching stream info:', err.message);
    return { fileId: null, error: 'An unexpected error occurred.' };
  }
}

export default async function WatchPage({ params, searchParams }: { params: { id:string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const { season, episode } = searchParams;
  const { fileId, error } = await getStreamInfo(params.id, season as string, episode as string);

  if (error) {
      return (
        <div className="bg-black text-white min-h-screen h-screen flex flex-col relative items-center justify-center">
            <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
                <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
            </header>
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground max-w-md text-center">{error}</p>
        </div>
      )
  }

  if (!fileId) {
    return (
      <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
        <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
          <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center p-4 h-full">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold">Streaming Not Available</h1>
            <p className="text-muted-foreground max-w-md">This content has not been uploaded to the library yet.</p>
          </div>
        </main>
      </div>
    );
  }

  // Use the Next.js backend proxy route to stream the video.
  const streamUrl = `/api/stream/${fileId}`;
  
  return (
    <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
      <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
        <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
      </header>
       <main className="flex-1 flex items-center justify-center">
          <VideoPlayer streamUrl={streamUrl} />
        </main>
    </div>
  );
}
