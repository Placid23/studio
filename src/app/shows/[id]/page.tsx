import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';
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
    getMediaRating(id),
    getUserRating(id)
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
      <div className="relative h-[45vh] md:h-[65vh] w-full img-container">
        <ImageLoader
          src={show.backdropUrl!}
          alt={`Backdrop for ${show.title}`}
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-50"
          priority
          data-ai-hint="tv show backdrop"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="container mx-auto -mt-32 md:-mt-48 relative z-10 px-4 md:px-8 pb-16">
        <BackButton />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 img-container rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
            <ImageLoader
              src={show.posterUrl!}
              alt={`Poster for ${show.title}`}
              width={500}
              height={750}
              className="rounded-3xl"
              data-ai-hint="tv show poster"
            />
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4 text-foreground pt-8 md:pt-16">
            <h1 className="text-4xl md:text-7xl font-black text-primary uppercase tracking-tighter leading-tight">{show.title}</h1>
            <div className="flex items-center flex-wrap gap-x-6 gap-y-2 mt-6 text-muted-foreground">
              {show.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-black text-xl text-foreground">{show.rating.toFixed(1)}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Global TMDB</span>
                </div>
              )}
              {show.year > 0 && (
                <>
                   {show.rating > 0 && <span className="text-muted-foreground/30">/</span>}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-bold">{show.year}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6">
              {show.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="rounded-lg px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">{genre}</Badge>
              ))}
            </div>

            <p className="mt-8 max-w-3xl text-lg text-foreground/80 leading-relaxed font-medium">{show.synopsis}</p>
            
            <div className="mt-10 flex items-center gap-4 flex-wrap">
                <TVStreamer showName={show.title} isLoggedIn={isLoggedIn} />
            </div>

            <div className="mt-12 max-w-xl">
                <RatingSystem 
                    mediaId={show.tmdbId} 
                    initialUserRating={userRating}
                    platformRating={platformRatingData.averageRating}
                    totalRatings={platformRatingData.totalRatings}
                />
            </div>
          </div>
        </div>
        
        <div className="mt-16">
            <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                Official Trailer
            </h2>
            <TrailerPlayer posterUrl={show.backdropUrl!} trailerUrl={show.trailerUrl} />
        </div>
        
        <Suspense fallback={null}>
            <SimilarMedia mediaId={show.tmdbId} mediaType="tv" />
        </Suspense>

      </div>
    </div>
  );
}
