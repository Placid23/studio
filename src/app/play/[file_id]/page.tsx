
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import type { Track } from '@/lib/types';

export default async function PlaySongPage({ params }: { params: { file_id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=You must be logged in to play music.');
  }

  const { file_id } = params;

  // Fetch the song's metadata from your `liked_songs` table using the file_id
  const { data: songMetadata, error: metadataError } = await supabase
    .from('liked_songs')
    .select('id, title, artist_name, album_title, album_cover_url, duration, album_id')
    .eq('file_id', file_id)
    .single();

  if (metadataError || !songMetadata) {
      // This could happen if the file_id is invalid or doesn't exist in the table
      return notFound();
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('songs') // Assuming your bucket is named 'songs'
    .createSignedUrl(file_id, 60 * 60); // URL is valid for 1 hour

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
                <p className="text-muted-foreground max-w-md">Could not generate a secure link to play the song. {signedUrlError?.message}</p>

                </div>
            </main>
        </div>
    );
  }
  
  // Use the fetched metadata to create a full Track object for the player
  const fullTrack: Track = {
    id: songMetadata.id,
    title: songMetadata.title,
    artist: { name: songMetadata.artist_name },
    album: { id: songMetadata.album_id || 0, title: songMetadata.album_title, cover_xl: songMetadata.album_cover_url || ''},
    duration: songMetadata.duration,
    preview: signedUrlData.signedUrl, // Use the full signed URL as the "preview" for the player
    type: 'track'
  };


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
