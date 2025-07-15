
'use server';

import { stripHtml } from "string-strip-html";

// This should point to your local instance of the fmovies-api
// IMPORTANT: This must be the address of the API, not the proxy.
const API_URL = process.env.FMOVIES_API_URL || 'http://127.0.0.1:5000';

async function fetchFromApi(path: string, params: Record<string, string> = {}) {
    // This API doesn't use a standard / separator
    const url = new URL(path, API_URL + "/"); 
    
    // Add any query params
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    
    try {
        console.log(`[fmovies] Fetching: ${url.toString()}`);
        const response = await fetch(url.toString(), {
            // This API can be slow, so we disable caching and increase timeout if needed
            // For server components, we use next.revalidate, but for direct fetch, it's about not caching errors.
            cache: 'no-store'
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[fmovies] API Error for path ${path}: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`The streaming provider API returned an error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;

    } catch (error: any) {
        console.error(`[fmovies] Network Error on path: ${path}. URL: ${url.toString()}. Error: ${error.message}`);
        throw new Error(`Failed to connect to the streaming provider API. Is it running at ${API_URL}?`);
    }
}


/**
 * Searches for a movie or TV show by title.
 * @param query The title of the media to search for.
 * @returns A URL to the media's detail page on the provider's site.
 */
export async function getMediaInfo(title: string, year?: number): Promise<{ url: string } | null> {
    const data = await fetchFromApi('search', { q: title });
    
    if (!data || !data.results || data.results.length === 0) {
        return null;
    }

    // Find the best match. The API results can be messy.
    // We prefer an exact title match and a close year match if available.
    const normalizedTitle = title.toLowerCase();
    
    let bestMatch = data.results[0]; // Default to first result
    
    const perfectMatch = data.results.find((item: any) => 
        item.title && item.title.toLowerCase() === normalizedTitle &&
        (year && item.year ? Math.abs(item.year - year) <= 1 : true)
    );

    if (perfectMatch) {
        bestMatch = perfectMatch;
    }

    if (!bestMatch.url) return null;

    return {
        url: bestMatch.url,
    };
}


/**
 * Scrapes the media detail page to find the stream URL.
 * @param mediaUrl The URL of the media's detail page from getMediaInfo.
 * @returns A direct URL to the video stream (.mp4 or .m3u8).
 */
export async function getStreamUrl(mediaUrl: string): Promise<string | null> {
    const data = await fetchFromApi('details', { url: mediaUrl });
    
    if (!data || !data.stream_url) {
        return null;
    }
    
    return data.stream_url;
}
