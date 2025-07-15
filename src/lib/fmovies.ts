
'use server';

import type { Stream } from '@/app/actions/get-stream-url';
import axios from 'axios';

// This should point to your local instance of the fmovies-api
const API_URL = 'http://127.0.0.1:5000';

async function fetchFromApi(path: string, params: Record<string, string> = {}) {
    const url = `${API_URL}${path}`;
    
    try {
        console.log(`[fmovies] Fetching with axios: ${url} with params: ${JSON.stringify(params)}`);
        const response = await axios.get(url, { 
            params,
            timeout: 20000 // 20 second timeout
        });
        
        if (response.status !== 200) {
            console.error(`[fmovies] API Error for path ${path}: ${response.status} ${response.statusText}`, response.data);
            throw new Error(`The streaming provider API returned an error: ${response.statusText}`);
        }
        
        // The scraping API might return a string or non-JSON on error/not found.
        // Let's ensure we only return if we get a valid object.
        if (typeof response.data === 'object' && response.data !== null) {
            return response.data;
        }

        console.warn(`[fmovies] Received non-JSON response for ${path}:`, response.data);
        return null;


    } catch (error: any) {
        if (axios.isAxiosError(error)) {
             console.error(`[fmovies] Axios Error on path: ${path}. URL: ${url}. Error: ${error.message}`);
             if (error.code === 'ECONNREFUSED' || error.response?.status === 404) {
                 throw new Error(`Failed to connect to the streaming provider API. Is it running at ${API_URL}?`);
             }
        } else {
            console.error(`[fmovies] Generic Error on path: ${path}. URL: ${url}. Error:`, error);
        }
        throw new Error(`An unexpected error occurred while contacting the streaming provider.`);
    }
}


/**
 * Searches for a movie or TV show by title.
 * @param query The title of the media to search for.
 * @returns A URL to the media's detail page on the provider's site.
 */
export async function getMediaInfo(title: string, year?: number): Promise<{ url: string } | null> {
    const data = await fetchFromApi('/search', { keyword: title });
    
    if (!data || !data.data || data.data.length === 0) {
        return null;
    }

    const normalizedTitle = title.toLowerCase();
    
    let bestMatch = data.data[0];
    
    const perfectMatch = data.data.find((item: any) => 
        item.title && item.title.toLowerCase() === normalizedTitle &&
        (year && item.year ? Math.abs(item.year - year) <= 1 : true)
    );

    if (perfectMatch) {
        bestMatch = perfectMatch;
    }

    if (!bestMatch.link) return null;

    return {
        url: bestMatch.link,
    };
}


/**
 * Scrapes the media detail page to find the stream URL.
 * @param mediaUrl The URL of the media's detail page from getMediaInfo.
 * @returns An array of stream objects with quality and URL.
 */
export async function getStreamUrl(mediaUrl: string): Promise<Stream[] | null> {
    const data = await fetchFromApi('/details', { link: mediaUrl });
    
    if (!data || !data.streams || Object.keys(data.streams).length === 0) {
        return null;
    }
    
    // The API returns an object where keys are qualities and values are URLs.
    // We need to convert this to an array of objects.
    return Object.entries(data.streams).map(([quality, url]) => ({
        quality,
        url: url as string,
    }));
}
