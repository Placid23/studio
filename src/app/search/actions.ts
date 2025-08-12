
'use server';

import type { Movie, Show } from "@/lib/types";
import { getAvailableGenres as getGenresFromApi, searchMedia as searchTmdb } from "@/lib/tmdb";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function addMediaToLibraryAction(media: Movie | Show): Promise<{ success: boolean; message: string }> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { success: false, message: "Supabase is not configured." };
    }

    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "You must be logged in to add to your library." };
    }

    const { error } = await supabase.from('movies').insert({
        tmdb_id: parseInt(media.tmdbId),
        title: media.title,
        type: media.type,
        poster_url: media.posterUrl,
        backdrop_url: media.backdropUrl,
        rating: media.rating,
        year: media.year,
        genres: media.genres,
        synopsis: media.synopsis,
    });

    if (error) {
        if (error.code === '23505') { // unique violation
             return { success: false, message: `${media.title} is already in the library.` };
        }
        console.error("Error adding to library:", error);
        return { success: false, message: `Could not add to library: ${error.message}` };
    }

    revalidatePath('/library');
    return { success: true, message: `${media.title} has been added to your library. Please add the file_id in Supabase.` };
}
