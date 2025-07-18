
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
  if (filters.genre && filters.genre !== 'all') {
    const movieGenres = await getGenresFromApi('movie');
    const tvGenres = await getGenresFromApi('tv');
    const allGenres = [...movieGenres, ...tvGenres];

    const genreName = allGenres.find(g => String(g.id) === filters.genre)?.name;
    
    if (genreName) {
      return results.filter(item => item.genres.includes(genreName));
    }
  }

  // Remove duplicates by title, preferring tmdb results
  const uniqueResults = new Map<string, Movie | Show>();
  for (const item of results) {
    if (!uniqueResults.has(item.title)) {
      uniqueResults.set(item.title, item);
    }
  }

  return Array.from(uniqueResults.values());
}
