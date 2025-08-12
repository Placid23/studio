
'use server';

import { getNewReleases, type SpotifyTrack } from '@/lib/spotify';
import { searchMusicbrainzRelease, type SearchedTrack } from '@/lib/musicbrainz';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getNewReleasesAction(): Promise<SearchedTrack[]> {
    const spotifyTracks = await getNewReleases();

    const enrichedTracks = await Promise.all(
        spotifyTracks.map(async (track) => {
            // The Spotify /browse/new-releases endpoint returns Album objects.
            // We are treating the album as a "track" for simplicity in the UI.
            const baseTrack: SearchedTrack = {
                mbid: track.id, // Use spotify ID as the unique key for this list
                title: track.name,
                artist: track.artists[0]?.name || 'Unknown Artist',
                album: track.name,
                coverUrl: track.images[0]?.url,
            };

            try {
                // Try to enrich with MusicBrainz data
                const mbData = await searchMusicbrainzRelease(baseTrack.artist, baseTrack.album);
                return {
                    ...baseTrack,
                    label: mbData?.label,
                    releaseCountry: mbData?.country,
                    mbid: mbData?.mbid || baseTrack.mbid, // prefer musicbrainz mbid if found
                };
            } catch (e) {
                // If MusicBrainz fails, still return the Spotify data
                return baseTrack;
            }
        })
    );

    return enrichedTracks;
}

export async function addMusicTrackAction(track: SearchedTrack): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    
    // Check for user login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: "You must be logged in to add music." };
    }

    const { error } = await supabase.from('music_tracks').insert({
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
