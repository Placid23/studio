
'use client';

import { useEffect, useState } from 'react';
import { notFound, useSearchParams, useParams } from 'next/navigation';
import { BackButton } from '@/components/layout/BackButton';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { getStreamUrlAction } from '@/app/actions/get-stream-url';
import { Loader2, AlertTriangle, Clapperboard, Tv } from 'lucide-react';

type LoadingState = 'loading' | 'error' | 'success';

function WatchStatus({ 
    status, 
    message, 
    mediaType 
}: { 
    status: LoadingState, 
    message: string, 
    mediaType: 'movie' | 'show' 
}) {
    let icon = null;
    let title = '';

    switch (status) {
        case 'loading':
            icon = <Loader2 className="w-16 h-16 text-primary animate-spin" />;
            title = 'Finding Stream...';
            break;
        case 'error':
            icon = <AlertTriangle className="w-16 h-16 text-destructive" />;
            title = 'Could Not Load Stream';
            break;
        default:
            return null;
    }

    return (
        <div className="absolute inset-0 bg-background flex flex-col items-center justify-center text-center p-4">
            <div className="flex items-center justify-center mb-4">
                {mediaType === 'movie' 
                    ? <Clapperboard className="w-24 h-24 text-muted-foreground/30 mr-4" />
                    : <Tv className="w-24 h-24 text-muted-foreground/30 mr-4" />
                }
                {icon}
            </div>
            <h1 className="text-2xl font-bold mt-4">{title}</h1>
            <p className="text-muted-foreground max-w-md">{message}</p>
        </div>
    );
}

export default function WatchPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [status, setStatus] = useState<LoadingState>('loading');
    const [message, setMessage] = useState('Please wait while we locate the best quality stream for you. This can sometimes take 20-30 seconds.');

    const id = params.id as string;
    const mediaType = (searchParams.get('season') && searchParams.get('episode')) ? 'show' : 'movie';
    const source = (searchParams.get('source') as 'tmdb' | 'tvmaze') || 'tmdb';

    useEffect(() => {
        if (!id) return;
        
        const fetchStream = async () => {
            setStatus('loading');
            const result = await getStreamUrlAction(id, mediaType, source);
            if (result.success && result.url) {
                setVideoSrc(result.url);
                setStatus('success');
                setMessage(result.message);
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        };

        fetchStream();
    }, [id, mediaType, source]);

    if (!id) {
        notFound();
    }

    return (
        <div className="bg-black text-white min-h-screen flex flex-col relative">
            <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent">
                <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
            </header>
            
            <main className="flex-1 flex items-center justify-center">
                {status !== 'success' && <WatchStatus status={status} message={message} mediaType={mediaType} />}
                {videoSrc && <VideoPlayer src={videoSrc} />}
            </main>
        </div>
    );
}
