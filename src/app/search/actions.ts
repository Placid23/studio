'use server';

import { discoverMovies, getGenres as fetchGenres, searchMovies } from "@/lib/tmdb";
import type { Movie } from "@/lib/types";

export async function getGenres() {
  return fetchGenres();
}

export async function findMovies(
  searchTerm: string,
  filters: { genre: string; rating: string; year: string }
): Promise<Movie[]> {
  let movies: Movie[];

  if (searchTerm) {
    movies = await searchMovies(searchTerm);
  } else {
    // If there's no search term, 'discover' endpoint handles filters server-side.
    return await discoverMovies(filters);
  }

  // If there was a search term, apply filters to the results
  // because the TMDB search endpoint doesn't support filtering.
  let filteredMovies = movies;

  if (filters.genre && filters.genre !== 'all') {
    const genreId = parseInt(filters.genre, 10);
    filteredMovies = filteredMovies.filter(movie => movie.genre_ids?.includes(genreId));
  }

  if (filters.rating && filters.rating !== 'all') {
    const minRating = parseFloat(filters.rating);
    filteredMovies = filteredMovies.filter(movie => movie.rating >= minRating);
  }

  if (filters.year && filters.year !== 'all') {
    const year = parseInt(filters.year, 10);
    filteredMovies = filteredMovies.filter(movie => movie.year === year);
  }

  return filteredMovies;
}
