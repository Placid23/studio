
'use server';

import { createClient } from "@/lib/supabase/server";
import { getSeasonDetails } from "@/lib/fmovies";
import type { Show, Episode } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function addToWatchlistAction(show: Show): Promise<{ success: boolean; message: string }> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { success: false, message: "Supabase is not configured." };
    }

    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "You must be logged in to add to your watchlist." };
    }

    const { error } = await supabase.from('movies').insert({
        // The new API uses the full link as the ID
        id: show.id,
        title: show.title,
        type: show.type, // Use 'TV' from the show object
        poster_url: show.posterUrl,
        rating: show.rating,
        year: show.year,
        genres: show.genres,
        synopsis: show.synopsis,
    });

    if (error) {
        if (error.code === '23505') { // unique violation
             return { success: false, message: `${show.title} is already in the library.` };
        }
        console.error("Error adding to watchlist:", error);
        return { success: false, message: `Could not add to library: ${error.message}` };
    }

    revalidatePath('/library');
    revalidatePath('/shows');
    return { success: true, message: `${show.title} has been added to your library.` };
}

export async function getEpisodesForSeason(showId: string, seasonNumber: number): Promise<Episode[]> {
    // This function is no longer supported by the new API.
    // We can return an empty array or remove related components later.
    return [];
}
