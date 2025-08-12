
'use server';

import { searchMusicbrainz, type SearchedTrack } from '@/lib/musicbrainz';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function searchMusicbrainzAction(query: string): Promise<SearchedTrack[]> {
  return searchMusicbrainz(query);
}

export async function addMusicTrackAction(track: SearchedTrack): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    
    // Check for user login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "You must be logged in to add music." };
    }

    const { error } = await supabase.from('music_tracks').insert({
        // We don't have a unique constraint on title/artist, so duplicates are possible.
        // This is acceptable for a music library.
        title: track.title,
        artist: track.artist,
        album: track.album,
        cover_url: track.coverUrl,
        file_id: 'placeholder.mp3' // User needs to update this manually
    });

    if (error) {
        console.error("Error adding music track:", error);
        return { success: false, message: `Could not add track: ${error.message}` };
    }

    revalidatePath('/music');
    return { success: true, message: `${track.title} has been added to your library. Remember to update the file_id!` };
}
