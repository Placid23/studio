import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, PlusCircle, Play } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { ImageLoader } from '@/components/media/ImageLoader';
import { WatchHistoryTracker } from '@/components/media/WatchHistoryTracker';
import { StreamingProviders, StreamingProvidersSkeleton } from '@/components/media/StreamingProviders';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Show } from '@/lib/types';


function mapSupabaseItemToShow(item: any): Show {
  return {
    id: String(item.id),
    supabaseId: item.id,
    title: item.title,
    type: 'show',
    year: item.year || 0,
    genres: item.genres || [],
    rating: item.rating || 0,
    synopsis: item.synopsis || 'No synopsis available.',
    posterUrl: item.poster_url || 'https://placehold.co/500x750.png',
    backdropUrl: item.backdrop_url || 'https://placehold.co/1920x1080.png',
  };
}

export default async function ShowDetailPage({ params }: { params: { id: string } }) {
  const showId = params.id;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('movies')
    .select('*, telegram_file_id')
    .eq('id', showId)
    .eq('type', 'show')
    .single();

  if (error || !data) {
    notFound();
  }

  const show = mapSupabaseItemToShow(data);

  return (
    <div className="animate-in fade-in-50 duration-500">
      <WatchHistoryTracker media={show} />
      <div className="relative h-[45vh] md:h-[65vh] w-full img-container">
        <ImageLoader
          src={show.backdropUrl!}
          alt={`Backdrop for ${show.title}`}
          fill
          style={{ objectFit: 'cover' }}
          className=""
          priority
          data-ai-hint="tv show backdrop"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="container mx-auto -mt-32 md:-mt-48 relative z-10 px-4 md:px-8 pb-16">
        <BackButton />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 img-container rounded-lg shadow-2xl">
            <ImageLoader
              src={show.posterUrl!}
              alt={`Poster for ${show.title}`}
              width={500}
              height={750}
              className="rounded-lg"
              data-ai-hint="tv show poster"
            />
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4 text-foreground pt-8 md:pt-16">
            <h1 className="text-4xl md:text-6xl font-black text-primary uppercase tracking-wide">{show.title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-lg text-foreground">{show.rating.toFixed(1)}</span>
              </div>
              {show.year > 0 && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{show.year}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {show.genres.map((genre) => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-lg text-foreground/90">{show.synopsis}</p>
            <div className="mt-8 flex items-center gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/80 text-accent-foreground">
                <PlusCircle className="mr-2 h-6 w-6" />
                Add to Watchlist
              </Button>
               {data && data.telegram_file_id && (
                <Link href={`/watch/${data.id}`} passHref>
                    <Button size="lg" variant="secondary">
                      <Play className="mr-2 h-6 w-6" />
                      Stream Now
                    </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <Suspense fallback={<StreamingProvidersSkeleton />}>
          <StreamingProviders media={show} />
        </Suspense>

      </div>
    </div>
  );
}
