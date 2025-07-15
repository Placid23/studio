
import { getTrending } from '@/lib/tmdb';
import { MediaCarousels } from '@/components/media/MediaCarousels';
import { ContinueWatchingCarousel } from '@/components/media/ContinueWatchingCarousel';
import { Suspense } from 'react';
import { MediaCarouselSkeleton } from '@/components/media/MediaCarousel';
import { HomePageClient } from '@/components/pages/HomePageClient';
import { AlertTriangle } from 'lucide-react';

async function getHeroMedia() {
    if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
        return { error: 'The TMDB_API_KEY environment variable is not configured.' };
    }
    try {
        const trendingData = await getTrending('movie');
        if (trendingData.length === 0) {
            return { error: 'Could not load trending media.' };
        }
        const heroMedia = trendingData[Math.floor(Math.random() * Math.min(trendingData.length, 10))];
        return { heroMedia };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to load trending media. Please try again later.' };
    }
}

export default async function Home() {
    const { heroMedia, error } = await getHeroMedia();

    if (error || !heroMedia) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
                    <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-destructive">Error</h1>
                    <p className="mt-2 text-destructive/80">{error || 'Could not load hero media.'}</p>
                </div>
            </div>
        );
    }
    
    return (
        <HomePageClient heroMedia={heroMedia}>
            <div className="flex flex-col gap-12 md:gap-16 py-8 lg:py-12 px-4 md:px-16 -mt-16 md:-mt-24 relative z-10">
                <ContinueWatchingCarousel />
                <Suspense fallback={<>
                    <MediaCarouselSkeleton />
                    <MediaCarouselSkeleton />
                    <MediaCarouselSkeleton />
                    <MediaCarouselSkeleton />
                    <MediaCarouselSkeleton />
                </>}>
                    <MediaCarousels />
                </Suspense>
            </div>
        </HomePageClient>
    );
}
