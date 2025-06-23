
import { Button } from '@/components/ui/button';
import { PlayCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { ImageLoader } from '@/components/media/ImageLoader';
import { ContinueWatchingCarousel } from '@/components/media/ContinueWatchingCarousel';
import type { Movie, Show } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { MediaCarousel } from '@/components/media/MediaCarousel';
import { AlertTriangle } from 'lucide-react';

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


export default async function Home() {
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
  const { data: mediaItems, error } = await supabase
    .from('movies')
    .select('id, title, type, poster_url, rating, year, genres, synopsis, backdrop_url')
    .order('created_at', { ascending: false })
    .limit(40);

  if (error) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Error Loading Media</h1>
          <p className="mt-2 text-destructive/80">{error.message}</p>
        </div>
      </div>
    );
  }

  const allMedia = (mediaItems || []).map(mapSupabaseItemToMedia);

  const heroMedia = allMedia.length > 0 ? allMedia[Math.floor(Math.random() * allMedia.length)] : null;

  const recentMovies = allMedia.filter(m => m.type === 'movie' && m.id !== heroMedia?.id);
  const recentShows = allMedia.filter(m => m.type === 'show' && m.id !== heroMedia?.id);

  if (!heroMedia) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">No media found in your library.</h1>
        <p className="text-muted-foreground">Add some via your Telegram bot!</p>
      </div>
    );
  }

  const heroLink = heroMedia.type === 'movie' ? `/movies/${heroMedia.id}` : `/shows/${heroMedia.id}`;

  return (
    <div className="flex flex-col">
      <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full img-container">
        <ImageLoader
          src={heroMedia.backdropUrl!}
          alt={heroMedia.title}
          fill
          style={{objectFit: "cover"}}
          className="absolute inset-0"
          priority
          data-ai-hint="movie backdrop"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-16 text-white">
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-wider text-primary [text-shadow:0_5px_15px_rgba(0,0,0,0.7)]">
            {heroMedia.title}
          </h1>
          <p className="max-w-xs md:max-w-xl mt-2 md:mt-4 text-sm md:text-lg font-medium [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
            {heroMedia.synopsis}
          </p>
          <div className="flex gap-4 mt-4">
            {heroMedia.supabaseId && (
              <Link href={`/watch/${heroMedia.supabaseId}`} passHref>
                <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground">
                  <PlayCircle className="mr-2 h-6 w-6" />
                  Play
                </Button>
              </Link>
            )}
            <Link href={heroLink} passHref>
               <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                <Info className="mr-2 h-6 w-6" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 md:gap-16 py-8 lg:py-12 px-4 md:px-16 -mt-16 md:-mt-24 relative z-10">
        <ContinueWatchingCarousel />
        <MediaCarousel title="Recent Movies" media={recentMovies} />
        <MediaCarousel title="Recent TV Shows" media={recentShows} />
      </div>
    </div>
  );
}
