import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/layout/BackButton';

export default async function WatchPage({ params }: { params: { id: string } }) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                 <h1 className="text-2xl font-bold text-destructive">Streaming Misconfigured</h1>
                 <p className="mt-2 text-destructive/80">Supabase URL or Key is not configured.</p>
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

    // IMPORTANT: This is a placeholder for the actual streaming URL.
    // You will need a backend endpoint that takes the telegram_file_id
    // and returns the video stream.
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
                    autoPlay
                    className="w-full h-full"
                    // The src attribute points to a non-existent API route.
                    // You need to implement this API route to handle streaming.
                    // src={videoSrc}
                >
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="mt-6 p-4 bg-card/80 border-l-4 border-primary text-foreground rounded-md shadow">
                <p className="font-bold text-primary">Developer Note:</p>
                <p className="mt-1">
                    The video player above is ready, but the streaming source (`src`) is commented out. You need to create a backend API route (e.g., at `{videoSrc}`) that takes the `telegram_file_id` and streams the video content from Telegram's servers.
                </p>
            </div>
        </div>
    );
}
