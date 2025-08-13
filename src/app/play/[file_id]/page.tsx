
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { AudioPlayer } from '@/components/media/AudioPlayer';

export default async function PlaySongPage({ params }: { params: { file_id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=You must be logged in to play music.');
  }

  const { file_id } = params;

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
  
  // We need track metadata to display something meaningful in the player
  // This part is tricky without knowing which song the file_id belongs to.
  // For now, we'll just show a generic player.
  const genericTrack = {
    id: Date.now(),
    title: "Now Playing",
    artist: { name: "Your Library" },
    album: { id: 0, title: "", cover_xl: ""},
    duration: 0, // We don't know the duration until it loads
    preview: signedUrlData.signedUrl, // Use the full signed URL as the "preview"
    type: 'track'
  } as const;


  return (
    <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider my-8">
            Now Playing
        </h1>
        <div className="max-w-2xl mx-auto">
            <AudioPlayer tracks={[genericTrack]} autoPlay />
        </div>
    </div>
  );
}

