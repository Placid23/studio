import { MediaCard } from '@/components/media/MediaCard';
import { createClient } from '@/lib/supabase/server';
import type { Movie, Show } from '@/lib/types';
import { AlertTriangle, Clapperboard } from 'lucide-react';

function mapSupabaseItemToMedia(item: any): Movie | Show {
    const common = {
      id: String(item.id),
      supabaseId: item.id,
      title: item.title,
      year: item.year || 0,
      genres: item.genres || [],
      rating: item.rating || 0,
      synopsis: item.synopsis || 'No synopsis available.',
      posterUrl: item.poster_url || 'https://placehold.co/500x750.png',
      backdropUrl: item.backdrop_url || 'https://placehold.co/1920x1080.png',
    };
    if (item.type === 'movie') {
      return { ...common, type: 'movie' };
    } else {
      return { ...common, type: 'show' };
    }
}

export default async function ShowsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Supabase Misconfigured</h1>
          <p className="mt-2 text-destructive/80">Supabase URL or Key is not configured.</p>
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.from('movies').select('*').eq('type', 'show').order('created_at', { ascending: false });

  const shows = (data || []).map(mapSupabaseItemToMedia) as Show[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-primary uppercase tracking-wider mb-8">
        TV Shows
      </h1>
      {error && <p className="text-destructive">Error loading shows: {error.message}</p>}
      {shows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {shows.map((show) => (
            <MediaCard key={show.id} media={show} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Clapperboard className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">No Shows Found</h2>
          <p className="mt-2 text-muted-foreground">Shows you upload via the Telegram bot will appear here.</p>
        </div>
      )}
    </div>
  );
}
