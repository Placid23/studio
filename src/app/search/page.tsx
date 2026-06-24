'use client';

import { Suspense, useState, useEffect, useTransition, useCallback } from 'react';
import type { Movie, Show } from '@/lib/types';
import { MediaCard } from '@/components/media/MediaCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Film, Loader2, Sparkles } from 'lucide-react';
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

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
    Promise.all([
        getAvailableGenres('movie'),
        getAvailableGenres('tv')
    ]).then(([movieGenres, tvGenres]) => {
        const combined = [...movieGenres, ...tvGenres];
        const uniqueGenres = Array.from(new Map(combined.map(g => [g.id, g])).values());
        setGenres(uniqueGenres);
    });
  }, []);

  const performSearch = useCallback(async (query: string, filterGenre: string) => {
    if (!query) {
        setMedia([]);
        return;
    }
    startTransition(async () => {
        try {
            const results = await searchMedia(query, { genre: filterGenre });
            setMedia(results);
        } catch (e) {
            console.error("Search error:", e);
            setMedia([]);
        }
    });
  }, []);

  useEffect(() => {
    const queryString = createQueryString({
      query: debouncedSearchTerm,
      genre,
    });
    
    router.replace(`${pathname}?${queryString}`, { scroll: false });
    performSearch(debouncedSearchTerm, genre);
  }, [debouncedSearchTerm, genre, performSearch, createQueryString, pathname, router]);

  const handleGenreChange = (newGenre: string) => {
    setGenre(newGenre);
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-12 space-y-6 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black text-primary uppercase tracking-tighter italic">Search Media</h1>
        <p className="text-muted-foreground font-medium text-lg">Locate any title across our expansive database</p>
        
        <div className="relative group mt-10">
          <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="What are you looking for today?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 text-xl h-16 rounded-[2rem] bg-card/40 backdrop-blur-xl border-white/5 focus-visible:ring-primary shadow-2xl relative z-10"
          />
        </div>
        
        <div className="flex justify-center gap-4">
          <Select value={genre} onValueChange={handleGenreChange} defaultValue="all">
            <SelectTrigger className="w-[240px] h-12 rounded-xl bg-card/50 border-white/5">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending ? (
         <div className="flex flex-col items-center justify-center text-center py-32 bg-card/20 backdrop-blur-xl rounded-[4rem] border border-white/5 border-dashed max-w-6xl mx-auto">
          <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
          </div>
          <h2 className="mt-8 text-3xl font-black uppercase tracking-tighter">Locating Intel...</h2>
          <p className="text-muted-foreground font-bold mt-2 uppercase tracking-widest text-[10px]">Scanning multiple data sources</p>
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 max-w-7xl mx-auto">
          {media.map((item) => (
            <MediaCard key={`${item.type}-${item.tmdbId}`} media={item} showAddButton={true} />
          ))}
        </div>
      ) : searchTerm ? (
        <div className="flex flex-col items-center justify-center text-center py-32 bg-card/20 rounded-[4rem] border border-white/5 max-w-6xl mx-auto">
          <Film className="w-20 h-20 text-muted-foreground/20 mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">No results found for "{searchTerm}"</h2>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">The title may not be available yet or exists under a different variation.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-32 bg-card/20 rounded-[4rem] border border-white/5 max-w-6xl mx-auto">
          <Sparkles className="w-20 h-20 text-primary/20 mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Start your search</h2>
          <p className="text-muted-foreground mt-2">Enter a title, actor, or genre to begin exploring.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-background flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
