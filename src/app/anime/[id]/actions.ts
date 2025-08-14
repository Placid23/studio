
'use server';

import { createClient } from "@/lib/supabase/server";
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
        tmdb_id: parseInt(show.tmdbId),
        title: show.title,
        type: 'anime', // Saving with the correct type
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
    revalidatePath('/anime');
    return { success: true, message: `${show.title} has been added to your library.` };
}


export async function downloadAnimeEpisodeAction(show: Show, episode: Episode): Promise<{ success: boolean; message: string; data: any; }> {
    const downloadData = {
        title: show.title,
        season: episode.season_number,
        episode: episode.episode_number,
    };

    // THIS IS THE LINK:
    // In a real application, you would trigger your backend service here.
    // The `fetch` call below sends the structured anime data to your Python server's API endpoint.
    // Your Python server would then receive this data, run the Selenium script,
    // and handle the download process.

    /*
    try {
      const response = await fetch('https://your-python-backend.com/download', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            // You might add an API key here for security
            // 'Authorization': `Bearer ${process.env.YOUR_PYTHON_BACKEND_API_KEY}`
        },
        body: JSON.stringify(downloadData),
      });

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.statusText}`);
      }
      
      const result = await response.json(); // Or handle streaming response
      console.log("Response from Python backend:", result);

    } catch (error) {
        console.error("Error communicating with Python backend:", error);
        return { 
            success: false, 
            message: `Could not start download: ${(error as Error).message}`,
            data: downloadData
        };
    }
    */
    
    console.log("Initiating download for:", downloadData);

    return { 
        success: true, 
        message: `Download initiated for ${show.title} S${episode.season_number}E${episode.episode_number}.`,
        data: downloadData
    };
}
