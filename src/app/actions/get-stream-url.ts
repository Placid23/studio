'use server';

import { search, getStream } from '@/lib/streaming';

export interface Stream {
  quality: string;
  url: string;
}

export async function getStreamUrlAction(
  mediaTitle: string
): Promise<{ streams: Stream[]; error?: string }> {
  console.log(`Searching for: ${mediaTitle}`);
  const searchResult = await search(mediaTitle);

  if (searchResult.error || !searchResult.url) {
    console.error('Search failed:', searchResult.error);
    return { streams: [], error: searchResult.error || 'Could not find the media on the provider.' };
  }

  console.log(`Found media URL: ${searchResult.url}, getting stream...`);
  const streamResult = await getStream(searchResult.url);

  if (streamResult.error || !streamResult.streams || streamResult.streams.length === 0) {
    console.error('Getting stream failed:', streamResult.error);
    return { streams: [], error: streamResult.error || 'Could not retrieve stream URL.' };
  }

  console.log(`Successfully found ${streamResult.streams.length} streams.`);
  return { streams: streamResult.streams };
}
