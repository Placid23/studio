
import { notFound } from 'next/navigation';
import { getStreamUrlAction, type Stream } from '@/app/actions/get-stream-url';
import { getMovieDetails, getShowDetails } from '@/lib/tmdb';
import type { Movie, Show } from '@/lib/types';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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

function WatchPageWrapper({ params, searchParams }: { params: { id: string }; searchParams: { season?: string, episode?: string } }) {
    // This component is necessary because we need to use useSearchParams on the client,
    // but the parent needs to be an async component to fetch data.
    // However, we can't make this a client component directly and await data.
    // Instead we will pass the searchParams to the page component.
    return <WatchPage params={params} searchParams={searchParams} />;
}


export default async function WatchPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const season = searchParams.season as string | undefined;
  const episode = searchParams.episode as string | undefined;
  
  // Attempt to fetch both movie and show details. One will succeed.
  const moviePromise = getMovieDetails(params.id);
  const showPromise = getShowDetails(params.id);
  
  const [movie, show] = await Promise.all([moviePromise, showPromise]);
  const media = movie || show; // One of them will be non-null

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
