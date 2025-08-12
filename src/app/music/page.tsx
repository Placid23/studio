
import { Music } from 'lucide-react';

export default async function MusicPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Music className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">
          Discover Music
        </h1>
      </div>
      
      <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
        <Music className="w-16 h-16 text-muted-foreground/50" />
        <h2 className="mt-6 text-2xl font-bold">Music Feature Coming Soon</h2>
        <p className="mt-2 text-muted-foreground">We're working on a new and improved music experience.</p>
      </div>
    </div>
  );
}
