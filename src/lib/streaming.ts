
import axios from 'axios';
import type { Stream } from '@/app/actions/get-stream-url';

const API_URL = process.env.STREAMING_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

export async function search(
  title: string
): Promise<{ url?: string; error?: string }> {
  if (!API_URL) {
    return { error: 'STREAMING_API_URL is not configured in your environment variables.' };
  }
  try {
    const response = await apiClient.get('/search', { params: { keyword: title } });
    if (response.data && response.data.url) {
      return { url: response.data.url };
    }
    return { error: 'No URL found in search response.' };
  } catch (error: any) {
    console.error('API Search Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
         return { error: `Failed to connect to the streaming provider API. Is it running at ${API_URL}?` };
    }
    return { error: 'Failed to search for media.' };
  }
}

export async function getStream(
  mediaUrl: string
): Promise<{ streams?: Stream[]; error?: string }> {
  if (!API_URL) {
    return { error: 'STREAMING_API_URL is not configured in your environment variables.' };
  }
  try {
    const response = await apiClient.get('/stream', { params: { url: mediaUrl } });
     if (response.data && Array.isArray(response.data.streams) && response.data.streams.length > 0) {
      return { streams: response.data.streams };
    }
    return { error: 'No streams found in the response from the provider.' };
  } catch (error: any) {
    console.error('API Stream Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
         return { error: `Failed to connect to the streaming provider API. Is it running at ${API_URL}?` };
    }
    return { error: 'Failed to retrieve stream data.' };
  }
}
