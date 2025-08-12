
'use client';

import { useState, useTransition } from 'react';
import type { SearchedTrack } from '@/lib/musicbrainz';
import { searchMusicbrainzAction, addMusicTrackAction } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Music, Loader2, PlusCircle, Library } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageLoader } from '@/components/media/ImageLoader';
import { BackButton } from '@/components/layout/BackButton';

export default function MusicSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchedTrack[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }
    startSearchTransition(async () => {
      const searchResults = await searchMusicbrainzAction(query);
      setResults(searchResults);
    });
  };

  const handleAddTrack = (track: SearchedTrack) => {
    startSearchTransition(async () => {
      const result = await addMusicTrackAction(track);
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };

  // Effect to trigger search when debounced term changes
  useState(() => {
    handleSearch(debouncedSearchTerm);
  });

  return (
    <div className="container mx-auto px-4 py-8">
       <BackButton />
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">Search Music</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value)
                handleSearch(e.target.value)
            }}
            className="w-full pl-10 text-lg h-12"
          />
        </div>
      </div>

      {isSearching && searchTerm ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="mt-6 text-2xl font-bold">Searching...</h2>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((track) => (
            <div
              key={track.mbid}
              className="flex items-center p-3 rounded-lg transition-colors bg-card/50 hover:bg-secondary"
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden img-container mr-4">
                <ImageLoader src={track.coverUrl!} alt={track.album || 'album cover'} fill style={{ objectFit: 'cover' }} data-ai-hint="album art" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{track.title}</p>
                <p className="text-sm text-muted-foreground">{track.artist} - <span className="italic">{track.album}</span></p>
              </div>
              <Button onClick={() => handleAddTrack(track)} disabled={isSearching}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add to Library
              </Button>
            </div>
          ))}
        </div>
      ) : searchTerm ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Music className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">No results found for "{searchTerm}"</h2>
          <p className="mt-2 text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Library className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">Search the Music Universe</h2>
          <p className="mt-2 text-muted-foreground">Find tracks to add to your library.</p>
        </div>
      )}
    </div>
  );
}
