
import { Globe, Wifi } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-background text-foreground">
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Radar-like scanning circles */}
        <div className="absolute w-full h-full border-2 rounded-full border-primary/20 animate-ping-slow" />
        <div className="absolute w-2/3 h-2/3 border-2 rounded-full border-primary/30 animate-ping-medium" />
        <div className="absolute w-1/3 h-1/3 border-2 rounded-full border-primary/40 animate-ping-fast" />

        {/* Central Globe Icon */}
        <Globe className="w-24 h-24 text-primary drop-shadow-lg" />
        
        {/* Pulsing Wifi Icon */}
        <Wifi className="absolute top-8 right-8 w-8 h-8 text-accent animate-pulse" />
      </div>
      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold tracking-wider uppercase">Finding What's Popular Near You...</h1>
        <p className="text-muted-foreground">Please allow location access for a personalized experience.</p>
      </div>
    </div>
  );
}
