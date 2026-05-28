'use server';

import { getSeasonDetails } from "@/lib/tmdb";
import type { Show, Episode } from "@/lib/types";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function addToWatchlistAction(show: Show): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
        return { success: false, message: "You must be logged in to add to your watchlist." };
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const showRef = adminDb.collection('users').doc(userId).collection('watchlist').doc(String(show.tmdbId));
        
        await showRef.set({
            tmdb_id: parseInt(show.tmdbId),
            title: show.title,
            type: 'tv',
            poster_url: show.posterUrl,
            backdrop_url: show.backdropUrl,
            rating: show.rating,
            year: show.year,
            genres: show.genres,
            synopsis: show.synopsis,
            addedAt: Date.now()
        });

        revalidatePath('/library');
        revalidatePath('/shows');
        return { success: true, message: `${show.title} has been added to your library.` };
    } catch (error: any) {
        console.error("Error adding to watchlist:", error);
        return { success: false, message: `Could not add to library: ${error.message}` };
    }
}

export async function getEpisodesForSeason(showId: string, seasonNumber: number): Promise<Episode[]> {
    return getSeasonDetails(showId, seasonNumber);
}
