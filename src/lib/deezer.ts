'use server';

const BASE_URL = 'https://api.deezer.com';

export async function deezerGet(path: string, params: Record<string, string> = {}) {
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
        throw new Error(`Deezer API error ${res.status}: ${txt}`);
    }

    const data = await res.json();
    if (data.error) {
        console.error(`Deezer API returned an error for ${path}:`, data.error);
        throw new Error(`Deezer API error: ${data.error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch from Deezer path ${path}:`, error);
    // Return a default structure for the specific type of data expected
    if (path.startsWith('chart') || path.startsWith('genre')) {
      return { data: [] };
    }
    return null;
  }
}
