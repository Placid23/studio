'use server';

import type { Movie } from "@/lib/types";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function addToWatchlistAction(movie: Movie): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
        return { success: false, message: "You must be logged in to add to your watchlist." };
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const movieRef = adminDb.collection('users').doc(userId).collection('watchlist').doc(String(movie.tmdbId));
        
        await movieRef.set({
            tmdb_id: parseInt(movie.tmdbId),
            title: movie.title,
            type: 'movie',
            poster_url: movie.posterUrl,
            backdrop_url: movie.backdropUrl,
            rating: movie.rating,
            year: movie.year,
            genres: movie.genres,
            synopsis: movie.synopsis,
            addedAt: Date.now()
        });

        revalidatePath('/library');
        return { success: true, message: `${movie.title} has been added to your library.` };
    } catch (error: any) {
        console.error("Error adding to watchlist:", error);
        return { success: false, message: `Could not add to library: ${error.message}` };
    }
}
