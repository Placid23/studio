'use server';

import type { Movie, Show } from "@/lib/types";
import { getAvailableGenres as getGenresFromApi, searchMedia as searchTmdb } from "@/lib/tmdb";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getAvailableGenres(mediaType: 'movie' | 'tv' = 'movie'): Promise<{id: number, name: string}[]> {
  return getGenresFromApi(mediaType);
}

export async function searchMedia(
  searchTerm: string,
  filters: { genre: string; year: string; }
): Promise<(Movie | Show)[]> {
  
  // If we have a query, use multi-search
  let results: (Movie | Show)[] = [];
  if (searchTerm) {
    results = await searchTmdb(searchTerm);
  } else {
    // If no search term but filters exist, we could implement a discover-based fetch
    // For MVP, we'll return empty if no term is provided yet, or fetch trending
    return [];
  }

  // Client-side filtering on results (since multi-search doesn't support easy genre/year filters in a single call)
  if (filters.genre && filters.genre !== 'all') {
    const movieGenres = await getGenresFromApi('movie');
    const tvGenres = await getGenresFromApi('tv');
    const allGenres = [...movieGenres, ...tvGenres];
    const genreName = allGenres.find(g => String(g.id) === filters.genre)?.name;
    
    if (genreName) {
      results = results.filter(item => item.genres.includes(genreName));
    }
  }

  if (filters.year && filters.year !== 'all') {
      const yearInt = parseInt(filters.year);
      results = results.filter(item => item.year === yearInt);
  }

  const uniqueResults = new Map<string, Movie | Show>();
  for (const item of results) {
    const key = `${item.type}-${item.tmdbId}`;
    if (!uniqueResults.has(key)) {
      uniqueResults.set(key, item);
    }
  }

  return Array.from(uniqueResults.values());
}

export async function addMediaToLibraryAction(media: Movie | Show): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
        return { success: false, message: "You must be logged in to add to your library." };
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const watchlistRef = adminDb.collection('users').doc(userId).collection('watchlist').doc(String(media.tmdbId));
        
        await watchlistRef.set({
            tmdb_id: parseInt(media.tmdbId),
            title: media.title,
            type: media.type,
            poster_url: media.posterUrl,
            backdrop_url: media.backdropUrl,
            rating: media.rating,
            year: media.year,
            genres: media.genres,
            synopsis: media.synopsis,
            addedAt: Date.now()
        });

        revalidatePath('/library');
        return { success: true, message: `${media.title} has been added to your library.` };
    } catch (error: any) {
        console.error("Error adding to library:", error);
        return { success: false, message: `Could not add to library: ${error.message}` };
    }
}
