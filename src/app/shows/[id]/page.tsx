import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, Users, PlaySquare } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { ImageLoader } from '@/components/media/ImageLoader';
import { WatchHistoryTracker } from '@/components/media/WatchHistoryTracker';
import { Suspense } from 'react';
import { getShowDetails } from '@/lib/tmdb';
import { TrailerPlayer } from '@/components/media/TrailerPlayer';
import { SimilarMedia } from '@/components/media/SimilarMedia';
import { AlertTriangle } from 'lucide-react';
import { TVStreamer } from '@/components/media/TVStreamer';
import { cookies } from 'next/headers';
import { RatingSystem } from '@/components/media/RatingSystem';
import { getMediaRating, getUserRating } from '@/app/actions/ratings';

export default async function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive">TMDB API Key Missing</h1>
          <p className="mt-2 text-destructive/80">The NEXT_PUBLIC_TMDB_API_KEY environment variable is not configured.</p>
        </div>
      </div>
    );
  }
  
  const [show, platformRatingData, userRating] = await Promise.all([
    getShowDetails(id),
    getMediaRating(id).catch(() => ({ averageRating: 0, totalRatings: 0 })),
    getUserRating(id).catch(() => 0)
  ]);

  if (!show) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-token')?.value;
  const isLoggedIn = !!token;

  return (
    <div className="animate-in fade-in-50 duration-500">
      <WatchHistoryTracker media={show} />
      
      {/* Background Section */}
      <div className="relative h-[60vh] md:h-[85vh] w-full">
        <ImageLoader
          src={show.backdropUrl!}
          alt={show.title}
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-40"
          priority
          data-ai-hint="tv show backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto -mt-[35vh] md:-mt-[45vh] relative z-10 px-4 md:px-12 pb-16">
        <BackButton className="mb-12 border-white/10 bg-black/20 hover:bg-white/5 text-white backdrop-blur-xl rounded-2xl h-12 px-6" />
        
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          {/* Poster Card */}
          <div className="w-full max-w-[320px] mx-auto lg:mx-0 shrink-0">
            <div className="img-container rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden ring-4 ring-primary/10">
                <ImageLoader
                src={show.posterUrl!}
                alt={show.title}
                width={500}
                height={750}
                className="rounded-[2.5rem]"
                data-ai-hint="tv show poster"
                />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-foreground pt-8 md:pt-16">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {show.genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="rounded-full px-5 py-1.5 font-bold uppercase tracking-widest text-[9px] bg-white/5 border-white/5 text-primary">
                    {genre}
                    </Badge>
                ))}
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                {show.title}
              </h1>
            </div>

            <div className="flex items-center flex-wrap gap-x-8 gap-y-4 mt-10 text-muted-foreground border-y border-white/5 py-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-400/10 rounded-2xl">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-black text-2xl leading-none">{show.rating.toFixed(1)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mt-1">TMDB Global</div>
                </div>
              </div>
              
              {show.year > 0 && (
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-primary/10 rounded-2xl">
                    <Calendar className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                       <div className="text-white font-black text-2xl leading-none">{show.year}</div>
                       <div className="text-[10px] font-bold uppercase tracking-widest mt-1">Premiere</div>
                   </div>
                </div>
              )}

              {show.seasons && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-zinc-500/10 rounded-2xl">
                        <PlaySquare className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                        <div className="text-white font-black text-2xl leading-none">{show.seasons.length}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mt-1">Seasons</div>
                    </div>
                </div>
              )}
            </div>

            <p className="mt-10 max-w-4xl text-xl text-foreground/70 leading-relaxed font-medium">
              {show.synopsis}
            </p>
            
            <div className="mt-12 flex items-center gap-4 flex-wrap bg-white/5 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                <TVStreamer showName={show.title} isLoggedIn={isLoggedIn} />
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <RatingSystem 
                    mediaId={show.tmdbId} 
                    initialUserRating={userRating}
                    platformRating={platformRatingData.averageRating}
                    totalRatings={platformRatingData.totalRatings}
                />
                
                {show.cast && show.cast.length > 0 && (
                    <div className="bg-card/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Leading Roles</h3>
                        <div className="flex flex-wrap gap-2">
                             {show.cast.slice(0, 6).map(name => (
                                 <span key={name} className="text-sm font-bold text-white/80 bg-white/5 px-4 py-2 rounded-xl">{name}</span>
                             ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
        
        <div className="mt-32">
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter flex items-center gap-4">
                <span className="w-12 h-1.5 bg-primary rounded-full"></span>
                Official Cinematic Trailer
            </h2>
            <div className="rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
                <TrailerPlayer posterUrl={show.backdropUrl!} trailerUrl={show.trailerUrl} />
            </div>
        </div>
        
        <Suspense fallback={null}>
            <SimilarMedia mediaId={show.tmdbId} mediaType="tv" />
        </Suspense>

      </div>
    </div>
  );
}
