'use client';

import { Suspense, useState, useEffect, useTransition, useCallback } from 'react';
import type { Movie } from '@/lib/types';
import { MediaCard } from '@/components/media/MediaCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Film, Loader2 } from 'lucide-react';
import { getGenres, findMovies } from './actions';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const allYears = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isInitializing, setIsInitializing] = useState(true);

  // State for filters, initialized with defaults and populated from URL via useEffect
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('all');
  const [rating, setRating] = useState('all');
  const [year, setYear] = useState('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Function to create/update URL search params.
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
  
  // Fetch genres on component mount.
  useEffect(() => {
    getGenres().then(setGenres);
  }, []);
  
  // Initialize filter state from URL search params on mount.
  useEffect(() => {
    setSearchTerm(searchParams.get('query') || '');
    setGenre(searchParams.get('genre') || 'all');
    setRating(searchParams.get('rating') || 'all');
    setYear(searchParams.get('year') || 'all');
    setIsInitializing(false);
  }, [searchParams]);

  // Effect to fetch movies when filters change, but not on initial render.
  useEffect(() => {
    if (isInitializing) return;

    startTransition(async () => {
      const results = await findMovies(debouncedSearchTerm, { genre, rating, year });
      setMovies(results);
    });

    // Update the URL with the new search params.
    const queryString = createQueryString({
      query: debouncedSearchTerm,
      genre,
      rating,
      year
    });
    router.push(`${pathname}?${queryString}`);

  }, [debouncedSearchTerm, genre, rating, year, createQueryString, pathname, router, isInitializing]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">Search Movies</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 text-lg h-12"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="9">9+ Stars</SelectItem>
              <SelectItem value="8">8+ Stars</SelectItem>
              <SelectItem value="7">7+ Stars</SelectItem>
              <SelectItem value="6">6+ Stars</SelectItem>
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {allYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(isPending || isInitializing) ? (
         <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="mt-6 text-2xl font-bold">Finding your next favorite movie...</h2>
          <p className="mt-2 text-muted-foreground">Please wait a moment</p>
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MediaCard key={movie.id} media={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Film className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">No movies found</h2>
          <p className="mt-2 text-muted-foreground">Try a different search term or adjust the filters.</p>
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
