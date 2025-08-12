
'use server';

import type { MusicTrack } from './types';

const MUSICBRAINZ_API_BASE = 'https://musicbrainz.org/ws/2';
const COVERART_API_BASE = 'https://coverartarchive.org';

const USER_AGENT = 'NovaStream/1.0.0 ( https://your-app-url.com )';

async function fetcher(url: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    headers: {
      'Accept': 'application/json',
      'User-Agent': USER_AGENT,
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  };
  const res = await fetch(url, { ...defaultOptions, ...options });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`MusicBrainz API error: ${res.status} ${res.statusText}`, { url, errorBody });
    throw new Error(`Failed to fetch from MusicBrainz API: ${res.statusText}`);
  }
  return res.json();
}

export interface SearchedTrack {
  mbid: string;
  title: string;
  artist: string;
  album: string;
  releaseId?: string;
  coverUrl?: string;
}

export async function searchMusicbrainz(query: string): Promise<SearchedTrack[]> {
  if (!query) return [];

  const url = `${MUSICBRAINZ_API_BASE}/recording/?query=${encodeURIComponent(query)}&limit=20&fmt=json`;
  const data = await fetcher(url);

  if (!data.recordings) return [];

  const tracks: SearchedTrack[] = data.recordings.map((rec: any) => ({
    mbid: rec.id,
    title: rec.title,
    artist: rec['artist-credit']?.[0]?.name || 'Unknown Artist',
    album: rec.releases?.[0]?.title || 'Unknown Album',
    releaseId: rec.releases?.[0]?.id,
  }));

  // Fetch cover art for tracks that have a release ID
  const tracksWithCovers = await Promise.all(
    tracks.map(async (track) => {
      if (track.releaseId) {
        try {
          const coverUrl = await getCoverArt(track.releaseId);
          return { ...track, coverUrl };
        } catch (error) {
          // It's okay if cover art fails, we can still show the track
          return { ...track, coverUrl: 'https://placehold.co/128x128.png' };
        }
      }
      return { ...track, coverUrl: 'https://placehold.co/128x128.png' };
    })
  );

  return tracksWithCovers;
}

export async function getCoverArt(releaseId: string): Promise<string | undefined> {
  // We have to fetch the release to get the correct cover art URL,
  // as direct calls can be redirected.
  try {
    const res = await fetch(`${COVERART_API_BASE}/release/${releaseId}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
        redirect: 'follow', // Important: follow redirects
    });
    if (!res.ok) return undefined;

    const data = await res.json();
    const frontImage = data.images?.find((img: any) => img.front);
    return frontImage?.thumbnails?.small || frontImage?.image; // Prefer small thumbnail, fallback to full image
  } catch(e) {
      // Errors are expected if no cover art exists.
      return undefined;
  }
}
