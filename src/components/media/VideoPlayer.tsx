'use client';

interface VideoPlayerProps {
    src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
    return (
        <div className="w-full max-w-6xl aspect-video">
            <video
                controls
                autoPlay
                src={src}
                className="w-full h-full rounded-lg shadow-2xl"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
