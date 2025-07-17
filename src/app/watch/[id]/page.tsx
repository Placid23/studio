
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/layout/BackButton';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { AlertTriangle } from 'lucide-react';

async function getStreamInfo(tmdbId: string): Promise<{ fileId: string | null; error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { fileId: null, error: 'Supabase environment variables are not configured.' };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('movies')
      .select('file_id')
      .eq('tmdb_id', parseInt(tmdbId))
      .maybeSingle(); // Use maybeSingle() to allow 0 or 1 row.

    if (error) {
      console.error('Supabase error fetching file_id:', error.message);
      // We don't need to check for PGRST116 anymore, maybeSingle handles it.
      return { fileId: null, error: `Could not fetch streaming info: ${error.message}` };
    }

    return { fileId: data?.file_id || null };
  } catch (err: any) {
    console.error('Unexpected error fetching stream info:', err.message);
    return { fileId: null, error: 'An unexpected error occurred.' };
  }
}

export default async function WatchPage({ params }: { params: { id:string } }) {
  const { fileId, error } = await getStreamInfo(params.id);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return (
      <div className="bg-black text-white min-h-screen h-screen flex flex-col relative items-center justify-center">
         <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
            <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
         </header>
         <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
         <h1 className="text-2xl font-bold">Configuration Error</h1>
         <p className="text-muted-foreground max-w-md text-center">The `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` is not set in the environment variables.</p>
      </div>
    );
  }
  
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

  const streamUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`;
  
  // NOTE: Telegram's getFile method doesn't return the direct file. 
  // It returns a JSON object with a `file_path`.
  // A reverse proxy or serverless function is needed to then construct the final URL:
  // `https://api.telegram.org/file/bot<token>/<file_path>`
  // This client-side implementation will not work directly due to CORS and the two-step fetch process.
  // For this prototype, we will show a message. A real implementation needs a backend proxy.

  return (
    <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
      <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
        <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
      </header>
       <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center p-4 h-full">
            <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold">Backend Proxy Required</h1>
            <p className="text-muted-foreground max-w-lg text-center">
              Direct streaming from Telegram is not possible from the browser. A backend component is needed to proxy the video stream.
            </p>
             <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left text-sm font-mono max-w-full overflow-x-auto">
                <p><span className="text-green-400">File ID found:</span> {fileId}</p>
                <p className="mt-2"><span className="text-yellow-400">Next Step:</span> Create a serverless function or backend route that takes this file_id, calls Telegram's API to get the file_path, and then streams the file from `https://api.telegram.org/file/bot{'{TOKEN}'}/{'{file_path}'}` to the client.</p>
            </div>
          </div>
        </main>
    </div>
  );
}
