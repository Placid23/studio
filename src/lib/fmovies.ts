
'use server';

import type { Stream } from '@/app/actions/get-stream-url';
import axios from 'axios';

// The URL should be configurable via an environment variable.
// This allows the Next.js server to connect to the API running on the host machine, not just localhost.
const API_URL = process.env.STREAMING_API_URL || 'http://127.0.0.1:5000';

async function fetchFromApi(path: string, params: Record<string, string> = {}) {
    const url = new URL(path, API_URL);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    
    try {
        console.log(`[fmovies] Fetching with axios: ${url.toString()}`);
        const response = await axios.get(url.toString(), { 
            timeout: 20000 // 20 second timeout
        });
        
        if (response.status !== 200) {
            console.error(`[fmovies] API Error for path ${path}: ${response.status} ${response.statusText}`, response.data);
            throw new Error(`The streaming provider API returned an error: ${response.statusText}`);
        }
        
        if (typeof response.data === 'object' && response.data !== null) {
            return response.data;
        }

        console.warn(`[fmovies] Received non-JSON response for ${path}:`, response.data);
        return null;

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
             console.error(`[fmovies] Axios Error on path: ${path}. URL: ${url}. Error: ${error.message}`);
             if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.response?.status === 404) {
                 throw new Error(`Failed to connect to the streaming provider API. Is it running at ${API_URL}?`);
             }
        } else {
            console.error(`[fmovies] Generic Error on path: ${path}. URL: ${url}. Error:`, error);
        }
        throw new Error(`An unexpected error occurred while contacting the streaming provider.`);
    }
}

/**
 * Scrapes the media detail page to find the stream URL.
 * @param mediaUrl The URL of the media's detail page.
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
