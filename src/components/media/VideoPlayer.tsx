'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl: string;
}

export function VideoPlayer({ streamUrl }: VideoPlayerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    let errorMessage = 'An unknown video error occurred.';

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
          errorMessage = `The video could not be loaded, either because the server or network failed or because the format is not supported. URL: ${streamUrl}`;
          break;
        default:
          errorMessage = `An unknown error occurred. Code: ${videoElement.error.code}`;
          break;
      }
    }
    setError(errorMessage);
  };

  if (error) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-8">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Video Playback Error</h2>
        <p className="text-center text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black">
      <video
        key={streamUrl} // Add key to force re-render on URL change
        className="w-full h-full"
        controls
        autoPlay
        src={streamUrl}
        onError={handleError}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
