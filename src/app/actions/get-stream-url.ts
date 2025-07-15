
'use server';

import { getMediaInfo, getStreamUrl } from '@/lib/fmovies';
import { getMovieDetails, getShowDetails } from '@/lib/tmdb';
import type { Movie, Show } from '@/lib/types';

export interface Stream {
    quality: string;
    url: string;
}

export async function getStreamUrlAction(
    mediaId: string, 
    mediaType: 'movie' | 'show'
): Promise<{ success: boolean; streams?: Stream[]; message: string }> {
    try {
        let mediaTitle: string | undefined;
        let releaseYear: number | undefined;

        // 1. Get metadata from TMDB to find the title
        let media: Movie | Show | null = null;
        if (mediaType === 'movie') {
            media = await getMovieDetails(mediaId);
        } else {
            media = await getShowDetails(mediaId);
        }
        
        if (!media) {
            return { success: false, message: "Could not find media details." };
        }
        
        mediaTitle = media.title;
        releaseYear = media.year;

        if (!mediaTitle) {
            return { success: false, message: 'Media title is unknown, cannot search for stream.' };
        }

        // 2. Use the title to search the scraping API
        console.log(`[STREAM] Searching for '${mediaTitle}' (${releaseYear})`);
        const mediaInfo = await getMediaInfo(mediaTitle, releaseYear);
        if (!mediaInfo) {
            return { success: false, message: `Could not find a match for "${mediaTitle}" on the streaming provider.` };
        }

        console.log(`[STREAM] Found match: ${mediaInfo.url}. Now fetching stream URL.`);

        // 3. Get the actual stream URL from the media page
        const streams = await getStreamUrl(mediaInfo.url);
        if (!streams || streams.length === 0) {
            return { success: false, message: 'Found a match, but failed to extract the stream URL. The provider may have updated their site.' };
        }

        console.log(`[STREAM] Success! Got stream URLs for ${mediaTitle}.`);
        return { success: true, streams, message: "Stream URLs fetched successfully." };

    } catch (error: any) {
        console.error('[getStreamUrlAction Error]', error);
        return { success: false, message: error.message || 'An unknown error occurred while fetching the stream.' };
    }
}
