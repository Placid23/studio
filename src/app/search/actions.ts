'use server';

import type { Movie, Show } from "@/lib/types";
import { getAvailableGenres as getGenresFromApi, searchMedia as searchTmdb } from "@/lib/tmdb";

export async function getAvailableGenres(mediaType: 'movie' | 'tv' = 'movie'): Promise<{id: number, name: string}[]> {
  return getGenresFromApi(mediaType);
}

export async function searchMedia(
  searchTerm: string,
  filters: { genre: string; }
): Promise<(Movie | Show)[]> {
  // TMDB's multi-search doesn't support filtering by genre, rating, or year in the same way.
  // We will perform a text search, and if a genre is selected, we'd typically do another call.
  // For simplicity here, we'll just use the text search. Advanced filtering would require more complex logic.
  
  const results = await searchTmdb(searchTerm);

  if (filters.genre && filters.genre !== 'all') {
    return results.filter(item => item.genres.map(g => g.toLowerCase()).includes(filters.genre.toLowerCase()));
  }

  return results;
}
