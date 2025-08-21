
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { searchDeezer } from '@/lib/deezer';
import type { Track, Album, Artist } from '@/lib/types';
import { Loader2, Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResults {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
}

export function MusicSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      startTransition(async () => {
        const searchResults = await searchDeezer(debouncedQuery);
        setResults({
          tracks: searchResults.track?.data || [],
          albums: searchResults.album?.data || [],
          artists: searchResults.artist?.data || [],
        });
      });
    } else {
      setResults(null);
    }
  }, [debouncedQuery]);

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for tracks, albums, or artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 text-lg h-12"
        />
        {isPending && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
        )}
        {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
        )}
      </div>

      {results && (
        <div className="space-y-6 animate-in fade-in-50">
          {results.tracks.length > 0 && <ResultSection title="Tracks" items={results.tracks} />}
          {results.albums.length > 0 && <ResultSection title="Albums" items={results.albums} />}
          {results.artists.length > 0 && <ResultSection title="Artists" items={results.artists} />}
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, items }: { title: string; items: (Track | Album | Artist)[] }) {
  return (
    <section>
      <h3 className="text-2xl font-bold tracking-tight mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
            if ('nb_fan' in item) { // Artist
                return <ArtistCard key={item.id} artist={item} />;
            } else if ('cover_xl' in item) { // Album
                return <AlbumCard key={item.id} album={item} />;
            } else { // Track
                return <TrackCard key={item.id} track={item} />;
            }
        })}
      </div>
    </section>
  );
}

function TrackCard({ track }: { track: Track }) {
    return (
        <Link href={`/music/track/${track.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-card transition-colors group">
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 img-container">
                <Image src={track.album.cover_xl} alt={track.album.title} fill className="object-cover" />
            </div>
            <div>
                <p className="font-semibold truncate group-hover:text-primary">{track.title}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artist.name}</p>
            </div>
        </Link>
    );
}

function AlbumCard({ album }: { album: Album }) {
    return (
         <Link href={`/music/album/${album.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-card transition-colors group">
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 img-container">
                <Image src={album.cover_xl} alt={album.title} fill className="object-cover" />
            </div>
            <div>
                <p className="font-semibold truncate group-hover:text-primary">{album.title}</p>
                <p className="text-sm text-muted-foreground truncate">{album.artist.name}</p>
            </div>
        </Link>
    );
}

function ArtistCard({ artist }: { artist: Artist }) {
    return (
         <Link href={`/music/artist/${artist.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-card transition-colors group">
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 img-container">
                <Image src={artist.picture_xl} alt={artist.name} fill className="object-cover" />
            </div>
            <div>
                <p className="font-semibold truncate group-hover:text-primary">{artist.name}</p>
                <p className="text-sm text-muted-foreground">Artist</p>
            </div>
        </Link>
    );
}
