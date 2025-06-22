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
    // Pass the year filter directly to the TMDB API search endpoint.
    movies = await searchMovies(searchTerm, filters.year);
  } else {
    // If there's no search term, 'discover' endpoint handles filters server-side.
    return await discoverMovies(filters);
  }

  // If there was a search term, apply filters to the results.
  // The year filter is handled by the API, so we only need to filter by genre and rating.
  let filteredMovies = movies;

  if (filters.genre && filters.genre !== 'all') {
    const genreId = parseInt(filters.genre, 10);
    filteredMovies = filteredMovies.filter(movie => movie.genre_ids?.includes(genreId));
  }

  if (filters.rating && filters.rating !== 'all') {
    const minRating = parseFloat(filters.rating);
    filteredMovies = filteredMovies.filter(movie => movie.rating >= minRating);
  }

  return filteredMovies;
}
