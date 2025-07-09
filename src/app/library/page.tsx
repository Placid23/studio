import { createClient } from '@/lib/supabase/server';
import { MediaCard } from '@/components/media/MediaCard';
import type { Movie, Show } from '@/lib/types';
import { AlertTriangle, Clapperboard } from 'lucide-react';
import { redirect } from 'next/navigation';

function SupabaseError() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Supabase Misconfigured</h1>
        <p className="mt-2 text-destructive/80">Could not connect to the database. Please ensure your Supabase URL and Key are configured correctly in your environment variables.</p>
      </div>
    </div>
  )
}

export default async function LibraryPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <SupabaseError />;
  }

  let libraryItems: any[] | null = [];
  let fetchError: any = null;

  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // The redirect needs to be outside the try/catch or it will be caught.
      // Next.js throws an error for redirects that we don't want to catch here.
      return redirect('/login?message=You must be logged in to view your library.');
    }
    
    const { data, error } = await supabase.from('movies').select('id, title, type, poster_url, rating, year, genres, synopsis, backdrop_url').order('created_at', { ascending: false });

    libraryItems = data;
    fetchError = error;

  } catch (e) {
    // This catches errors during client creation or other unexpected issues.
    return <SupabaseError />;
  }

  if (fetchError) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
             <h1 className="text-2xl font-bold text-destructive">Error fetching library</h1>
             <p className="mt-2 text-destructive/80">{fetchError.message}</p>
        </div>
    )
  }

  const enrichedLibrary = (libraryItems || []).map(item => ({
    id: String(item.id),
    supabaseId: item.id,
    title: item.title,
    type: item.type,
    year: item.year || 0,
    genres: item.genres || [],
    rating: item.rating || 0,
    synopsis: item.synopsis || 'No synopsis available.',
    posterUrl: item.poster_url || 'https://placehold.co/500x750.png',
    backdropUrl: item.backdrop_url || 'https://placehold.co/1920x1080.png',
  })) as (Movie | Show)[];

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
