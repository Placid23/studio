import { getPopularAnime } from '@/lib/tmdb';
import { AlertTriangle } from 'lucide-react';
import { AnimeInfiniteScroll } from '@/components/media/AnimeInfiniteScroll';
import { AnimeSearch } from '@/components/media/AnimeSearch';

function TmdbError() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive">TMDB API Key Missing</h1>
        <p className="mt-2 text-destructive/80">The NEXT_PUBLIC_TMDB_API_KEY environment variable is not configured.</p>
      </div>
    </div>
  )
}

export default async function AnimePage() {
  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    return <TmdbError />;
  }

  let initialAnime = [];
  try {
    const popularAnime = await getPopularAnime(1);
    initialAnime = popularAnime.results;
  } catch (e: any) {
    console.error("Initial anime load error", e);
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
          <h1 className="text-5xl md:text-8xl font-black text-primary uppercase tracking-tighter italic mb-4">
            Anime
          </h1>
          <div className="h-1.5 w-32 bg-primary rounded-full shadow-[0_0_15px_rgba(225,29,72,0.4)]"></div>
      </div>
      
      <AnimeSearch>
         <AnimeInfiniteScroll initialAnime={initialAnime} />
      </AnimeSearch>
    </div>
  );
}
