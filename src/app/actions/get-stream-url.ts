'use server';

// This file is intentionally left blank.
// The previous streaming implementation has been removed.

export interface Stream {
  quality: string;
  url: string;
}

export async function getStreamUrlAction(
  mediaTitle: string
): Promise<{ streams: Stream[]; error?: string }> {
  return {
    streams: [],
    error: 'This streaming method is no longer supported.',
  };
}
