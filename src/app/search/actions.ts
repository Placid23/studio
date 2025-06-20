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
  if (searchTerm) {
    const searchResults = await searchMovies(searchTerm);
    // The TMDb discover endpoint doesn't support a search query.
    // So if a search term is provided, we prioritize it over filters.
    return searchResults;
  }
  return await discoverMovies(filters);
}
