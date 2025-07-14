
'use client';

interface VideoPlayerProps {
    src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
    if (!src) {
        return null; // Don't render player if there's no source
    }

    return (
        <div className="w-full h-full">
            <video
                key={src} // Add key to force re-render when src changes
                controls
                autoPlay
                src={src}
                className="w-full h-full object-contain"
                crossOrigin="anonymous" // Important for some stream types
            >
                <source src={src} type="application/x-mpegURL" />
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
