'use client';

interface VideoPlayerProps {
  streamUrl: string;
}

export function VideoPlayer({ streamUrl }: VideoPlayerProps) {
  return (
    <div className="w-full h-full bg-black">
      <video
        className="w-full h-full"
        controls
        autoPlay
        src={streamUrl}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
