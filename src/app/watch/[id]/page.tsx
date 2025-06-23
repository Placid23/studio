import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/layout/BackButton';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WatchPage({ params }: { params: { id: string } }) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-4">
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-destructive">Streaming Misconfigured</h1>
                <p className="mt-2 text-destructive/80">Supabase URL or Key is not configured.</p>
                </div>
            </div>
        )
    }

    const supabase = createClient();

    const { data: media, error } = await supabase
        .from('movies')
        .select('id, title, telegram_file_id')
        .eq('id', params.id)
        .single();

    if (error || !media || !media.telegram_file_id) {
        notFound();
    }

    const videoSrc = `/api/stream/${media.telegram_file_id}`;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
                <BackButton />
            </div>
            <h1 className="text-3xl font-bold mb-4">{media.title}</h1>
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                <video
                    controls
                    className="w-full h-full"
                    src={videoSrc}
                    // Add poster for a better loading experience
                    poster={media.backdrop_url || media.poster_url || ''}
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}
