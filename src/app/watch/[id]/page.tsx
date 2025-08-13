
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle } from 'lucide-react';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import type { Track } from '@/lib/types';

async function getMediaDetails(id: string, searchParams: { [key: string]: string | string[] | undefined }) {
    const supabase = createClient();
    const { season, episode, type } = searchParams;

    let fileId: string | null = null;
    let title: string = 'Content';
    let mediaType: 'video' | 'audio' = 'video';
    let audioTrack: Track | null = null;
    let bucket: 'videos' | 'songs' = 'videos';

    try {
        if (type === 'music') {
            mediaType = 'audio';
            bucket = 'songs';
            const { data, error } = await supabase
                .from('liked_songs')
                .select('file_id, title, artist_name, album_title, album_cover_url, duration, album_id, id')
                .eq('id', id)
                .single();
            
            if (error || !data) {
                console.error('Error fetching liked song:', error);
                return { error: 'Could not find this song in your liked songs.', fileId: null, title, mediaType, audioTrack, bucket };
            }
            
            fileId = data.file_id;
            title = data.title;
            audioTrack = {
                id: data.id,
                title: data.title,
                artist: { name: data.artist_name },
                album: { id: data.album_id || 0, title: data.album_title, cover_xl: data.album_cover_url || ''},
                duration: data.duration,
                preview: '', // The full URL will be added later
                type: 'track'
            };

        } else if (season && episode) {
            // It's a TV show episode
            mediaType = 'video';
            bucket = 'videos';
            const { data: showData, error: showError } = await supabase
                .from('movies')
                .select('title')
                .eq('tmdb_id', id)
                .eq('type', 'tv')
                .single();
            
            if (showError || !showData) throw showError || new Error('Show not found');

            const { data, error } = await supabase
                .from('tv_episodes')
                .select('file_id, title, season, episode')
                .eq('show_tmdb_id', id)
                .eq('season', season)
                .eq('episode', episode)
                .single();
            
            if (error || !data) throw error || new Error('Episode not found');
            fileId = data.file_id;
            title = `${showData.title} S${String(data.season).padStart(2, '0')}E${String(data.episode).padStart(2, '0')}`;

        } else {
            // It's a movie
            mediaType = 'video';
            bucket = 'videos';
            const { data, error } = await supabase
                .from('movies')
                .select('file_id, title')
                .eq('tmdb_id', id)
                .single();

            if (error || !data) throw error || new Error('Movie not found');
            fileId = data.file_id;
            title = data.title;
        }
    } catch (e: any) {
        console.error('Error fetching media details:', e.message);
        return { error: e.message, fileId: null, title, mediaType, audioTrack, bucket };
    }

    if (!fileId) {
        return { error: 'This item does not have a playable file associated with it in your library.', fileId: null, title, mediaType, audioTrack, bucket };
    }
    
    return { fileId, title, mediaType, audioTrack, bucket, error: null };
}


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
  const { fileId, title, mediaType, audioTrack, bucket, error } = await getMediaDetails(id, searchParams);

  if (!fileId || error) {
    return (
        <div className="bg-background text-foreground min-h-screen h-screen flex flex-col relative">
            <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
                <BackButton className="border-border bg-background/20 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm" />
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Media Not Found</h1>
                <p className="text-muted-foreground max-w-md">{error || 'This item could not be found in your library.'}</p>
                </div>
            </main>
        </div>
    );
  }

  // If fileId is a full URL, extract the path. Otherwise, use it as is.
  // This makes the system resilient to different data formats in the database.
  let filePath = fileId;
  try {
    const url = new URL(fileId);
    // The path is everything after `/object/sign/` or `/object/public/`
    // Splitting by the bucket name is a reliable way to get the file path.
    filePath = url.pathname.split(`/${bucket}/`)[1];
  } catch (e) {
    // Not a valid URL, so we assume it's already a file path.
  }
  
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60); // URL is valid for 1 hour

  if (signedUrlError || !signedUrlData) {
     return (
        <div className="bg-background text-foreground min-h-screen h-screen flex flex-col relative">
            <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
                <BackButton className="border-border bg-background/20 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm" />
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Streaming Error</h1>
                <p className="text-muted-foreground max-w-md">Could not generate a secure link to play the content. {signedUrlError?.message}</p>
                 <p className="text-sm text-muted-foreground/80 mt-2">Attempted to access: <code className="bg-muted px-1 py-0.5 rounded text-destructive">{filePath}</code> from bucket: <code className="bg-muted px-1 py-0.5 rounded text-destructive">{bucket}</code></p>
                </div>
            </main>
        </div>
    );
  }

  if (mediaType === 'audio' && audioTrack) {
    const fullTrack = { ...audioTrack, preview: signedUrlData.signedUrl };
    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="text-4xl font-black text-primary uppercase tracking-wider my-8">
                Now Playing
            </h1>
            <div className="max-w-2xl mx-auto">
                <AudioPlayer tracks={[fullTrack]} autoPlay />
            </div>
        </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
      <VideoPlayer src={signedUrlData.signedUrl} title={title} />
    </div>
  );
}
