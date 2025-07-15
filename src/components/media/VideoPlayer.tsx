
'use client';

import { useState, useEffect } from "react";
import type { Stream } from "@/app/actions/get-stream-url";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
    streams: Stream[];
}

export function VideoPlayer({ streams }: VideoPlayerProps) {
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

    useEffect(() => {
        if (streams && streams.length > 0) {
            // Default to the first available stream
            setSelectedStream(streams[0]);
        }
    }, [streams]);

    if (!streams || streams.length === 0) {
        return null;
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full h-full">
                {selectedStream && (
                     <video
                        key={selectedStream.url}
                        controls
                        autoPlay
                        src={selectedStream.url}
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                    >
                        <source src={selectedStream.url} type={selectedStream.url.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'} />
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
            {streams.length > 1 && (
                <div className="absolute bottom-16 right-4 z-20 flex gap-2">
                    {streams.map((stream) => (
                        <Button
                            key={stream.quality}
                            variant={selectedStream?.quality === stream.quality ? 'default' : 'outline'}
                            className="bg-black/50 border-white/30 text-white backdrop-blur-sm hover:bg-white/20"
                            onClick={() => setSelectedStream(stream)}
                        >
                            {stream.quality}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
