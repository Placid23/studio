import { Music, HardHat } from 'lucide-react';

export default function MusicPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center h-[calc(100vh-8rem)] animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4 text-primary">
        <Music className="w-16 h-16" />
        <h1 className="text-4xl font-black uppercase tracking-wider">
          Music
        </h1>
      </div>
      <div className="mt-8 p-8 bg-card/50 rounded-xl flex flex-col items-center max-w-md w-full">
        <HardHat className="w-12 h-12 text-muted-foreground/80 mb-4" />
        <h2 className="text-2xl font-bold">Coming Soon!</h2>
        <p className="mt-2 text-muted-foreground">
          This section is currently under construction. Check back later for music streaming and downloads.
        </p>
      </div>
    </div>
  );
}
