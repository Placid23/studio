'use client';

import { useState, useMemo, useEffect } from 'react';
import { MOVIES } from '@/lib/data';
import type { Movie } from '@/lib/types';
import { MovieCard } from '@/components/movies/MovieCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Film } from 'lucide-react';

const allGenres = [...new Set(MOVIES.flatMap(m => m.genres))];
const allYears = [...new Set(MOVIES.map(m => m.year))].sort((a, b) => b - a);

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('all');
  const [rating, setRating] = useState('all');
  const [year, setYear] = useState('all');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(MOVIES);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const filterMovies = () => {
      let movies = MOVIES;

      if (debouncedSearchTerm) {
        movies = movies.filter(m =>
          m.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }
      if (genre !== 'all') {
        movies = movies.filter(m => m.genres.includes(genre));
      }
      if (rating !== 'all') {
        movies = movies.filter(m => m.rating >= Number(rating));
      }
      if (year !== 'all') {
        movies = movies.filter(m => m.year === Number(year));
      }
      setFilteredMovies(movies);
    };

    filterMovies();
  }, [debouncedSearchTerm, genre, rating, year]);
  
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
              {allGenres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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
              {allYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Film className="w-24 h-24 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">No movies found</h2>
          <p className="mt-2 text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
