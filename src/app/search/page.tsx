'use client';

import { Suspense, useState, useEffect, useTransition, useCallback } from 'react';
import type { Movie, Show } from '@/lib/types';
import { MediaCard } from '@/components/media/MediaCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Film, Loader2, Sparkles, X, Filter } from 'lucide-react';
import { getAvailableGenres, searchMedia } from './actions';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
  const [media, setMedia] = useState<(Movie | Show)[]>([]);
  const [isPending, startTransition] = useTransition();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'all');
  const [year, setYear] = useState(searchParams.get('year') || 'all');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

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
        setGenres(uniqueGenres.sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, []);

  const performSearch = useCallback(async (query: string, filterGenre: string, filterYear: string) => {
    if (!query && filterGenre === 'all' && filterYear === 'all') {
        setMedia([]);
        return;
    }
    startTransition(async () => {
        try {
            const results = await searchMedia(query, { genre: filterGenre, year: filterYear });
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
      year,
    });
    
    if (searchParams.toString() !== queryString) {
        router.replace(`${pathname}?${queryString}`, { scroll: false });
    }
    performSearch(debouncedSearchTerm, genre, year);
  }, [debouncedSearchTerm, genre, year, performSearch, createQueryString, pathname, router, searchParams]);

  const resetFilters = () => {
    setSearchTerm('');
    setGenre('all');
    setYear('all');
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-12 space-y-8 max-w-4xl mx-auto text-center">
        <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-primary uppercase tracking-tighter italic drop-shadow-sm">Search Media</h1>
            <p className="text-muted-foreground font-medium text-lg">Locate any title across our expansive database</p>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="What are you looking for today?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-12 text-xl h-16 rounded-[2rem] bg-card/50 backdrop-blur-xl border-border focus-visible:ring-primary shadow-lg relative z-10"
          />
          {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-muted rounded-full transition-colors"
              >
                  <X className="h-4 w-4" />
              </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 bg-muted/30 p-4 rounded-[2.5rem] border border-border">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground px-2">
             <Filter className="w-3 h-3" /> Filters
          </div>

          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-background border-border font-bold text-xs uppercase tracking-wider">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background border-border font-bold text-xs uppercase tracking-wider">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={resetFilters} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
              Clear All
          </Button>
        </div>
      </div>

      {isPending ? (
         <div className="flex flex-col items-center justify-center text-center py-32 bg-card/20 backdrop-blur-xl rounded-[4rem] border border-border border-dashed max-w-6xl mx-auto">
          <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
          </div>
          <h2 className="mt-8 text-3xl font-black uppercase tracking-tighter">Locating Intel...</h2>
          <p className="text-muted-foreground font-bold mt-2 uppercase tracking-widest text-[10px]">Scanning multiple data sources</p>
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {media.map((item) => (
            <MediaCard key={`${item.type}-${item.tmdbId}`} media={item} showAddButton={true} />
          ))}
        </div>
      ) : (debouncedSearchTerm || genre !== 'all' || year !== 'all') ? (
        <div className="flex flex-col items-center justify-center text-center py-32 bg-card/20 rounded-[4rem] border border-border max-w-6xl mx-auto">
          <Film className="w-20 h-20 text-muted-foreground/20 mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">No matches found</h2>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium">Try adjusting your filters or checking your spelling for the best results.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-32 bg-card/20 rounded-[4rem] border border-border max-w-6xl mx-auto group">
          <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-700" />
              <Sparkles className="w-20 h-20 text-primary/30 relative z-10 transition-transform group-hover:scale-110" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Start your search</h2>
          <p className="text-muted-foreground mt-2 font-medium">Enter a title, actor, or genre to begin exploring the multiverse.</p>
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
