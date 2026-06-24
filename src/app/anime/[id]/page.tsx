import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Zap, Users } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { ImageLoader } from '@/components/media/ImageLoader';
import { WatchHistoryTracker } from '@/components/media/WatchHistoryTracker';
import { Suspense } from 'react';
import { getShowDetails } from '@/lib/tmdb';
import { TrailerPlayer } from '@/components/media/TrailerPlayer';
import { SimilarMedia } from '@/components/media/SimilarMedia';
import { AlertTriangle } from 'lucide-react';
import { EpisodeGuide } from '@/components/media/EpisodeGuide';
import type { Show } from '@/lib/types';
import { AddToWatchlistButton } from '@/components/media/AddToWatchlistButton';
import { addToWatchlistAction } from './actions';
import { DownloadButton } from '@/components/media/DownloadButton';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { TVStreamer } from '@/components/media/TVStreamer';
import { RatingSystem } from '@/components/media/RatingSystem';
import { getMediaRating, getUserRating } from '@/app/actions/ratings';

async function getLibraryItem(tmdbId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    if (!token || !adminAuth || !adminDb) return null;
    
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const doc = await adminDb.collection('users').doc(userId).collection('watchlist').doc(tmdbId).get().catch(() => null);
        return (doc && doc.exists) ? doc.data() : null;
    } catch (e) {
        return null;
    }
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  
  const [show, platformRatingData, userRating, libraryItem] = await Promise.all([
    getShowDetails(id),
    getMediaRating(id).catch(() => ({ averageRating: 0, totalRatings: 0 })),
    getUserRating(id).catch(() => 0),
    getLibraryItem(id)
  ]);

  if (!show) {
    notFound();
  }

  const anime: Show = { ...show, type: 'anime' };
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-token')?.value;
  const isLoggedIn = !!token;

  return (
    <div className="animate-in fade-in-50 duration-500">
      <WatchHistoryTracker media={anime} />
      
      {/* Anime Background */}
      <div className="relative h-[60vh] md:h-[85vh] w-full">
        <ImageLoader
          src={anime.backdropUrl!}
          alt={anime.title}
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-40"
          priority
          data-ai-hint="anime backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="container mx-auto -mt-[35vh] md:-mt-[45vh] relative z-10 px-4 md:px-12 pb-16">
        <BackButton className="mb-12 border-white/10 bg-black/20 hover:bg-white/5 text-white backdrop-blur-xl rounded-2xl h-12 px-6" />
        
        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          {/* Main Visual */}
          <div className="w-full max-w-[320px] mx-auto lg:mx-0 shrink-0">
            <div className="img-container rounded-[2.5rem] shadow-[0_0_50px_rgba(225,29,72,0.4)] border-4 border-primary/20 overflow-hidden">
                <ImageLoader
                src={anime.posterUrl!}
                alt={anime.title}
                width={500}
                height={750}
                className="rounded-[2.5rem]"
                data-ai-hint="anime poster"
                />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-foreground">
             <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="rounded-full px-5 py-1.5 font-bold uppercase tracking-widest text-[9px] bg-primary text-white">ANIME SERIES</Badge>
                {anime.genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="rounded-full px-5 py-1.5 font-bold uppercase tracking-widest text-[9px] bg-white/5 border-white/5 text-primary/80">
                    {genre}
                    </Badge>
                ))}
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                {anime.title}
              </h1>
            </div>

            <div className="flex items-center flex-wrap gap-x-8 gap-y-4 mt-10 text-muted-foreground border-y border-white/5 py-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-400/10 rounded-2xl">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-black text-2xl leading-none">{anime.rating.toFixed(1)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mt-1">TMDB Global</div>
                </div>
              </div>
              
              {anime.year > 0 && (
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-primary/10 rounded-2xl">
                    <Calendar className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                       <div className="text-white font-black text-2xl leading-none">{anime.year}</div>
                       <div className="text-[10px] font-bold uppercase tracking-widest mt-1">First Aired</div>
                   </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <div className="text-white font-black text-2xl leading-none">{anime.seasons?.length || 1}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mt-1">Arcs</div>
                </div>
              </div>
            </div>

            <p className="mt-10 max-w-4xl text-xl text-foreground/70 leading-relaxed font-medium">
              {anime.synopsis}
            </p>

            <div className="mt-12 flex items-center gap-4 flex-wrap bg-white/5 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              <TVStreamer showName={anime.title} isLoggedIn={isLoggedIn} />
              <AddToWatchlistButton media={anime} addAction={addToWatchlistAction} />
              {libraryItem?.file_id && (
                  <DownloadButton 
                      filePath={libraryItem.file_id}
                      bucket="videos"
                      fileName={`${anime.title}.mp4`}
                  />
              )}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <RatingSystem 
                    mediaId={anime.tmdbId} 
                    initialUserRating={userRating}
                    platformRating={platformRatingData.averageRating}
                    totalRatings={platformRatingData.totalRatings}
                />
                
                {anime.cast && anime.cast.length > 0 && (
                    <div className="bg-card/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                             Voice Cast
                        </h3>
                        <div className="flex flex-wrap gap-2">
                             {anime.cast.slice(0, 8).map(name => (
                                 <span key={name} className="text-sm font-bold text-white/80 bg-white/5 px-4 py-2 rounded-xl">{name}</span>
                             ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
        
        {anime.seasons && anime.seasons.length > 0 && (
          <div className="mt-32">
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter flex items-center gap-4">
                <span className="w-12 h-1.5 bg-blue-500 rounded-full"></span>
                Episode Guide
            </h2>
            <EpisodeGuide show={anime} />
          </div>
        )}

        <div className="mt-32">
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter flex items-center gap-4">
                <span className="w-12 h-1.5 bg-primary rounded-full"></span>
                Promotional PV
            </h2>
            <div className="rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl">
                <TrailerPlayer posterUrl={anime.backdropUrl!} trailerUrl={anime.trailerUrl} />
            </div>
        </div>
        
        <Suspense fallback={null}>
            <SimilarMedia mediaId={anime.tmdbId} mediaType="tv" />
        </Suspense>

      </div>
    </div>
  );
}
