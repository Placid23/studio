
'use server';

const BASE_URL = 'https://api.deezer.com';

export async function deezerGet(path: string, params: Record<string, string> = {}) {
  if (!path || path.endsWith('null') || path.endsWith('undefined')) {
    const errorMessage = `Attempted to fetch from Deezer with an invalid path: ${path}`;
    console.error(errorMessage);
    return { error: { message: errorMessage } };
  }
  
  const url = new URL(`${BASE_URL}/${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  try {
    const res = await fetch(url.toString(), {
        next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) {
        const txt = await res.text();
        console.error(`Deezer API error for ${path}: ${txt}`);
        return { error: { message: `Deezer API error ${res.status}: ${txt}` } };
    }

    const data = await res.json();
    
    // Check for Deezer's explicit error format OR an empty object for a single resource request.
    if (data.error || (typeof data === 'object' && data !== null && !Array.isArray(data) && Object.keys(data).length === 0 && !path.startsWith('chart') && !path.startsWith('search'))) {
        const errorMessage = data.error ? data.error.message : 'No data found for this resource.';
        console.error(`Deezer API returned an error for ${path}:`, data.error || 'Empty response');
        return { error: { message: errorMessage } };
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch from Deezer path ${path}:`, error);
    
    return { error: { message: (error as Error).message || 'Unknown fetch error' } };
  }
}

// Search for tracks, albums, and artists
export async function searchDeezer(query: string) {
    const res = await deezerGet('search', { q: query });
    if (res.error) {
        return { track: { data: [] }, album: { data: [] }, artist: { data: [] } };
    }
    // The search endpoint returns all types in the `data` array.
    // We need to fetch more specific results.
    const [tracks, albums, artists] = await Promise.all([
        deezerGet('search/track', { q: query, limit: '8' }),
        deezerGet('search/album', { q: query, limit: '8' }),
        deezerGet('search/artist', { q: query, limit: '8' })
    ]);
    
    return {
        track: tracks,
        album: albums,
        artist: artists
    };
}
