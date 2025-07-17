
'use client';

import { Suspense, useState, useEffect, useTransition, useCallback } from 'react';
import type { Movie, Show } from '@/lib/types';
import { MediaCard } from '@/components/media/MediaCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Film, Loader2 } from 'lucide-react';
import { getAvailableGenres, searchMedia } from './actions';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
  const [media, setMedia] = useState<(Movie | Show)[]>([]);
  const [isPending, startTransition] = useTransition();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'all');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value && value !== 'all') {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  useEffect(() => {
    getAvailableGenres('movie').then(setGenres);
  }, []);
  
  useEffect(() => {
    const initialQuery = searchParams.get('query') || '';
    const initialGenre = searchParams.get('genre') || 'all';
    
    // Only run search if there's an initial query
    if (initialQuery) {
        startTransition(async () => {
            const results = await searchMedia(initialQuery, { genre: initialGenre });
            setMedia(results);
        });
    } else {
        setMedia([]);
    }
  }, []); // Run only once on mount to populate from URL

  useEffect(() => {
    const queryString = createQueryString({
      query: debouncedSearchTerm,
      genre,
    });
    
    router.replace(`${pathname}?${queryString}`);
    
    if (debouncedSearchTerm) {
        startTransition(async () => {
          const results = await searchMedia(debouncedSearchTerm, { genre });
          setMedia(results);
        });
    } else {
        setMedia([]);
    }
  }, [debouncedSearchTerm, genre, createQueryString, pathname, router]);

  const handleGenreChange = (newGenre: string) => {
    setGenre(newGenre);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">Search Media</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for movies and TV shows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 text-lg h-12"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Select value={genre} onValueChange={handleGenreChange} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending ? (
         <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="mt-6 text-2xl font-bold">Searching...</h2>
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <MediaCard key={`${item.type}-${item.id}`} media={item} />
          ))}
        </div>
      ) : searchTerm ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Film className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">No results found for "{searchTerm}"</h2>
          <p className="mt-2 text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Search className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">Search for something</h2>
          <p className="mt-2 text-muted-foreground">Find your next favorite movie or show.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
