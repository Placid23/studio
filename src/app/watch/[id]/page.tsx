
import { notFound } from 'next/navigation';
import { getStreamUrlAction, type Stream } from '@/app/actions/get-stream-url';
import { getMovieDetails, getShowDetails } from '@/lib/tmdb';
import type { Movie, Show } from '@/lib/types';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

async function WatchContent({
  media,
  season,
  episode,
}: {
  media: Movie | Show;
  season?: string;
  episode?: string;
}) {
  let titleToSearch = media.title;
  if (media.type === 'show' && season && episode) {
    titleToSearch = `${media.title} Season ${season} Episode ${episode}`;
  }

  const { streams, error } = await getStreamUrlAction(titleToSearch);

  return (
    <div className="w-full h-full">
      {error ? (
        <div className="flex flex-col items-center justify-center text-center p-4 h-full">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold">Could Not Load Stream</h1>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
      ) : (
        <VideoPlayer streams={streams} />
      )}
    </div>
  );
}

function WatchPageLoader() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <h1 className="text-2xl font-bold">Preparing Your Stream...</h1>
            <p className="text-muted-foreground max-w-md">Communicating with provider, please wait.</p>
        </div>
    )
}

export default async function WatchPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const season = searchParams.season as string | undefined;
  const episode = searchParams.episode as string | undefined;
  
  // Fetch movie and show details sequentially to avoid race condition errors.
  let media: Movie | Show | null = await getMovieDetails(params.id);
  if (!media) {
    media = await getShowDetails(params.id);
  }

  if (!media) {
    notFound();
  }

  return (
    <div className="bg-black text-white min-h-screen h-screen flex flex-col relative">
      <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
        <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<WatchPageLoader />}>
            <WatchContent media={media} season={season} episode={episode} />
        </Suspense>
      </main>
    </div>
  );
}
