
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle } from 'lucide-react';

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=You must be logged in to watch content.');
  }

  const { id } = params;
  const { season, episode } = searchParams;

  let fileId: string | null = null;
  let title: string = 'Content';

  try {
    if (season && episode) {
      // It's a TV show episode
      const { data, error } = await supabase
        .from('tv_episodes')
        .select('file_id, title, season, episode')
        .eq('tmdb_id', id)
        .eq('season', season)
        .eq('episode', episode)
        .single();
      
      if (error || !data) {
        console.error('Error fetching TV episode:', error);
        notFound();
      }
      fileId = data.file_id;
      title = `${data.title} S${String(data.season).padStart(2, '0')}E${String(data.episode).padStart(2, '0')}`;
    } else {
      // It's a movie
      const { data, error } = await supabase
        .from('movies')
        .select('file_id, title')
        .eq('tmdb_id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching movie:', error);
        notFound();
      }
      fileId = data.file_id;
      title = data.title;
    }
  } catch (e) {
      console.error(e);
      notFound();
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
                <h1 className="text-2xl font-bold">Media Not Found in Library</h1>
                <p className="text-muted-foreground max-w-md">This item does not have a video file associated with it in your library.</p>
                </div>
            </main>
        </div>
    );
  }

  // Create a signed URL for the video file
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('videos') // Assumes your bucket is named 'videos'
    .createSignedUrl(fileId, 60 * 60); // URL is valid for 1 hour

  if (signedUrlError || !signedUrlData) {
     return (
        <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
            <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
                <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Streaming Error</h1>
                <p className="text-muted-foreground max-w-md">Could not generate a secure link to play the video. {signedUrlError?.message}</p>
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
      <VideoPlayer src={signedUrlData.signedUrl} title={title} />
    </div>
  );
}
