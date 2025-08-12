
import { MusicCard } from '@/components/media/MusicCard';
import { getSampleTracks } from '@/lib/music-data';
import { Music } from 'lucide-react';

export default function MusicPage() {
  const tracks = getSampleTracks();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Music className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">
          Discover Music
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tracks.map((track) => (
          <MusicCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}
