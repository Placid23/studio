'use server';

import { createClient } from "@/lib/supabase/server";
import type { Movie } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function addToWatchlistAction(movie: Movie): Promise<{ success: boolean; message: string }> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { success: false, message: "Supabase is not configured." };
    }

    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "You must be logged in to add to your watchlist." };
    }

    const { error } = await supabase.from('movies').insert({
        id: parseInt(movie.id),
        title: movie.title,
        type: 'Movie',
        poster_url: movie.posterUrl,
        backdrop_url: movie.backdropUrl,
        rating: movie.rating,
        year: movie.year,
        genres: movie.genres,
        synopsis: movie.synopsis,
    });

    if (error) {
        if (error.code === '23505') { // unique violation
             return { success: false, message: `${movie.title} is already in the library.` };
        }
        console.error("Error adding to watchlist:", error);
        return { success: false, message: `Could not add to library: ${error.message}` };
    }

    revalidatePath('/library');
    return { success: true, message: `${movie.title} has been added to your library.` };
}
