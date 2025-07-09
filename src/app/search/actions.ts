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
  
  const results = await searchTmdb(searchTerm);

  // If a genre filter is applied, filter the search results.
  // Note: TMDB's multi-search doesn't support pre-filtering by genre in the API call,
  // so we filter the results after they're fetched.
  if (filters.genre && filters.genre !== 'all') {
    const allGenres = await getGenresFromApi('movie');
    const genreName = allGenres.find(g => String(g.id) === filters.genre)?.name;
    
    if (genreName) {
      return results.filter(item => item.genres.includes(genreName));
    }
  }

  return results;
}
