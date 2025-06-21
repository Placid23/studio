import type { Show, Episode } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, Tv, Calendar } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { getShowDetails } from '@/lib/tvmaze';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ImageLoader } from '@/components/media/ImageLoader';
import { WatchHistoryTracker } from '@/components/media/WatchHistoryTracker';
import { TrailerPlayer } from '@/components/media/TrailerPlayer';
import { StreamingProviders, StreamingProvidersSkeleton } from '@/components/media/StreamingProviders';
import { Suspense } from 'react';

// Group episodes by season
function groupEpisodesBySeason(episodes: Episode[] = []): Record<string, Episode[]> {
  return episodes.reduce((acc, episode) => {
    const season = `Season ${episode.season}`;
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(episode);
    return acc;
  }, {} as Record<string, Episode[]>);
}

export default async function ShowDetailPage({ params }: { params: { id: string } }) {
  const show = await getShowDetails(params.id);

  if (!show) {
    notFound();
  }

  const episodesBySeason = groupEpisodesBySeason(show.episodes);

  return (
    <div className="animate-in fade-in-50 duration-500">
      <WatchHistoryTracker media={show} />
      <div className="relative h-[45vh] md:h-[65vh] w-full img-container">
        <ImageLoader
          src={show.backdropUrl}
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
              src={show.posterUrl}
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
              {show.episodes && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5" />
                    <span>{show.episodes.length} Episodes</span>
                  </div>
                </>
              )}
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
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Trailer</h2>
            <TrailerPlayer posterUrl={show.backdropUrl} trailerUrl={show.trailerUrl} />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Cast</h2>
             <div className="bg-white/5 rounded-lg p-6 border border-white/10 h-full max-h-[420px] overflow-y-auto">
                {show.cast && show.cast.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {show.cast.map((actor) => <span key={actor} className="text-foreground/90 truncate">{actor}</span>)}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Cast information not available.</p>
                )}
             </div>
          </div>
        </div>
        
        <Suspense fallback={<StreamingProvidersSkeleton />}>
          <StreamingProviders media={show} />
        </Suspense>

        {show.episodes && show.episodes.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Episodes</h2>
            <Accordion type="single" collapsible className="w-full bg-card/50 rounded-lg border border-border">
              {Object.entries(episodesBySeason).map(([season, episodes]) => (
                <AccordionItem value={season} key={season}>
                  <AccordionTrigger className="px-6 text-lg font-bold">{season}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col divide-y divide-border">
                      {episodes.map((episode) => (
                        <div key={episode.id} className="p-6 flex flex-col md:flex-row gap-4">
                           <div className="img-container rounded-md">
                             <ImageLoader
                                src={episode.imageUrl || 'https://placehold.co/400x225.png'}
                                alt={episode.name}
                                width={200}
                                height={112}
                                className="rounded-md aspect-video object-cover"
                                data-ai-hint="tv episode still"
                              />
                           </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-md text-primary">
                              E{episode.number}: {episode.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{episode.runtime} min</p>
                            <p className="text-sm text-foreground/80 mt-2">{episode.summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}
