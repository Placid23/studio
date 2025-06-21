import { createClient } from '@/lib/supabase/server';
import { MediaCard } from '@/components/media/MediaCard';
import { searchMovies } from '@/lib/tmdb';
import { getShowsByQuery } from '@/lib/tvmaze';
import type { Movie, Show } from '@/lib/types';
import { AlertTriangle, Clapperboard } from 'lucide-react';

async function enrichMedia(media: { id: any; title: string; type: 'movie' | 'show' }): Promise<(Movie | Show) & { supabaseId: any }> {
  let enrichedData: Movie | Show | undefined;

  // Simple title cleaning
  const cleanTitle = media.title.split(/S\d{2}E\d{2}/i)[0].replace(/\./g, ' ').trim();

  if (media.type === 'movie') {
    const results = await searchMovies(cleanTitle);
    enrichedData = results[0];
  } else {
    const results = await getShowsByQuery(cleanTitle);
    enrichedData = results[0];
  }

  if (enrichedData) {
    return { ...enrichedData, supabaseId: media.id, title: media.title };
  }

  // Fallback for when no match is found on external APIs
  return {
    id: `supabase-${media.id}`,
    supabaseId: media.id,
    title: media.title,
    type: media.type,
    year: new Date().getFullYear(),
    genres: [],
    rating: 0,
    synopsis: 'No information available.',
    posterUrl: 'https://placehold.co/500x750.png',
    backdropUrl: 'https://placehold.co/1920x1080.png',
  };
}

export default async function LibraryPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Streaming Misconfigured</h1>
          <p className="mt-2 text-destructive/80">Supabase URL or Key is not configured.</p>
        </div>
      </div>
    );
  }
  
  const supabase = createClient();
  const { data: libraryItems, error } = await supabase.from('movies').select('id, title, type').order('created_at', { ascending: false });

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
             <h1 className="text-2xl font-bold text-destructive">Error fetching library</h1>
             <p className="mt-2 text-destructive/80">{error.message}</p>
        </div>
    )
  }

  const enrichedLibrary = await Promise.all((libraryItems || []).map(enrichMedia));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-primary uppercase tracking-wider mb-8">
        My Library
      </h1>
      {enrichedLibrary.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {enrichedLibrary.map((media) => (
            <MediaCard 
              key={media.supabaseId} 
              media={media} 
              watchHref={`/watch/${media.supabaseId}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Clapperboard className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">Your Library is Empty</h2>
          <p className="mt-2 text-muted-foreground">Content you upload via the Telegram bot will appear here.</p>
        </div>
      )}
    </div>
  );
}
