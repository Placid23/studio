
import axios from 'axios';
import type { Stream } from '@/app/actions/get-stream-url';

const API_URL = process.env.STREAMING_API_URL;

if (!API_URL) {
    console.error("STREAMING_API_URL is not configured in your environment variables.");
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout
});

export async function search(
  title: string
): Promise<{ url?: string; error?: string }> {
  if (!API_URL) {
    return { error: 'STREAMING_API_URL is not configured in your environment variables.' };
  }
  try {
    console.log(`[Streaming API] Searching for keyword: ${title}`);
    const response = await apiClient.get('/search', { params: { keyword: title } });
    
    if (response.data && response.data.url) {
      console.log(`[Streaming API] Found details URL: ${response.data.url}`);
      return { url: response.data.url };
    }
    
    console.warn('[Streaming API] Search response did not contain a URL.');
    return { error: response.data.error || 'No URL found in search response from provider.' };

  } catch (error: any) {
    console.error('[Streaming API] Search request failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
         return { error: `Failed to connect to the streaming provider API. Is it running at ${API_URL}?` };
    }
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('[Streaming API] Error Response Data:', error.response.data);
      const apiError = error.response.data?.error || `API returned status ${error.response.status}`;
      return { error: apiError };
    }
    
    // Something happened in setting up the request that triggered an Error
    return { error: 'Failed to search for media due to a network or client error.' };
  }
}

export async function getStream(
  mediaUrl: string
): Promise<{ streams?: Stream[]; error?: string }> {
  if (!API_URL) {
    return { error: 'STREAMING_API_URL is not configured in your environment variables.' };
  }
  try {
    console.log(`[Streaming API] Getting streams for URL: ${mediaUrl}`);
    const response = await apiClient.get('/stream', { params: { url: mediaUrl } });

     if (response.data && Array.isArray(response.data.streams) && response.data.streams.length > 0) {
      console.log(`[Streaming API] Found ${response.data.streams.length} streams.`);
      return { streams: response.data.streams };
    }

    console.warn('[Streaming API] Get stream response did not contain any streams.');
    return { error: response.data.error || 'No streams found in the response from the provider.' };

  } catch (error: any) {
    console.error('[Streaming API] Get stream request failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
         return { error: `Failed to connect to the streaming provider API. Is it running at ${API_URL}?` };
    }
     if (error.response) {
      console.error('[Streaming API] Error Response Data:', error.response.data);
      const apiError = error.response.data?.error || `API returned status ${error.response.status}`;
      return { error: apiError };
    }
    return { error: 'Failed to retrieve stream data due to a network or client error.' };
  }
}
