
'use client';

import { useState } from 'react';
import { BackButton } from '@/components/layout/BackButton';

interface VideoPlayerProps {
  src: string;
  title: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    let errorMessage = 'An unknown error occurred.';

    if (videoElement.error) {
      switch (videoElement.error.code) {
        case videoElement.error.MEDIA_ERR_ABORTED:
          errorMessage = 'The video playback was aborted.';
          break;
        case videoElement.error.MEDIA_ERR_NETWORK:
          errorMessage = 'A network error caused the video download to fail.';
          break;
        case videoElement.error.MEDIA_ERR_DECODE:
          errorMessage = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
          break;
        case videoElement.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
          break;
        default:
          errorMessage = 'An unknown error occurred.';
          break;
      }
    }
    setError(`${errorMessage} URL: ${src.split('?')[0]}`);
  };


  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center">
       <header className="absolute top-0 left-0 p-4 z-20 w-full bg-gradient-to-b from-black/70 to-transparent flex justify-between items-center">
          <BackButton className="border-white/30 bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm" />
          <h1 className="text-lg font-semibold text-white truncate pr-4">{title}</h1>
      </header>
      {error ? (
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-destructive mb-2">Video Error</h2>
          <p className="text-muted-foreground max-w-lg">{error}</p>
        </div>
      ) : (
        <video
          key={src} // Add key to force re-render on src change
          controls
          autoPlay
          width="100%"
          height="auto"
          className="max-h-full"
          onError={handleError}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
