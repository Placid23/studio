'use server';

import { createClient } from "@/lib/supabase/server";
import type { Show } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function addToWatchlistAction(show: Show): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "You must be logged in to add to your watchlist." };
    }

    const { error } = await supabase.from('movies').insert({
        id: parseInt(show.id),
        title: show.title,
        type: 'show',
        poster_url: show.posterUrl,
        backdrop_url: show.backdropUrl,
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
    return { success: true, message: `${show.title} has been added to your library.` };
}
