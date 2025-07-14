import { BackButton } from '@/components/layout/BackButton';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { getMovieDetails } from '@/lib/tmdb';
import { getShowDetails as getShowDetailsFromTmdb } from '@/lib/tmdb';
import { getShowDetails as getShowDetailsFromTvmaze } from '@/lib/tvmaze';
import { notFound } from 'next/navigation';
import type { Show } from '@/lib/types';

export default async function WatchPage({ 
    params,
    searchParams
}: { 
    params: { id: string };
    searchParams: { season?: string, episode?: string, source?: 'tmdb' | 'tvmaze' }
}) {
    const videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    const isTvShow = searchParams.season && searchParams.episode;
    let title = "NovaStream";
    let subTitle = "";

    try {
        if (isTvShow) {
            let show: Show | null = null;
            if (searchParams.source === 'tvmaze') {
                show = await getShowDetailsFromTvmaze(params.id);
            } else {
                show = await getShowDetailsFromTmdb(params.id);
            }

            if(show) {
                title = show.title;
                subTitle = `S${searchParams.season} E${searchParams.episode}`;
            }
        } else {
            const movie = await getMovieDetails(params.id);
            if (movie) {
                title = movie.title;
            }
        }
    } catch (error) {
        console.error("Failed to fetch media details for watch page", error);
        // Do not block rendering, just use default titles.
    }
    
    if (!title) {
        notFound();
    }
    

    return (
        <div className="bg-black text-white min-h-screen flex flex-col">
            <header className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/70 to-transparent">
                <div>
                    <BackButton className="border-white/30 bg-transparent hover:bg-white/10 text-white" />
                    <div className="mt-2">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        {subTitle && <p className="text-muted-foreground">{subTitle}</p>}
                    </div>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center">
                <VideoPlayer src={videoSrc} />
            </main>
        </div>
    );
}
