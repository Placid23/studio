
'use server';

import { getStreamUrl } from '@/lib/fmovies';

export interface Stream {
    quality: string;
    url: string;
}

export async function getStreamUrlAction(
    mediaId: string, 
    mediaType: 'movie' | 'show'
): Promise<{ success: boolean; streams?: Stream[]; message: string }> {
    try {
        // Hardcode the URL to scrape as requested
        const mediaUrl = 'https://tapahtuma.tv/home';

        console.log(`[STREAM] Attempting to scrape: ${mediaUrl}`);
        
        const streams = await getStreamUrl(mediaUrl);

        if (!streams || streams.length === 0) {
            return { success: false, message: `Could not extract any streams from ${mediaUrl}. The provider may have updated their site or the content may not be available.` };
        }

        console.log(`[STREAM] Success! Got stream URLs from ${mediaUrl}.`);
        return { success: true, streams, message: "Stream URLs fetched successfully." };

    } catch (error: any) {
        console.error('[getStreamUrlAction Error]', error);
        return { success: false, message: error.message || 'An unknown error occurred while fetching the stream.' };
    }
}
