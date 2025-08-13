
'use server';

const BASE_URL = 'https://api.deezer.com';

export async function deezerGet(path: string, params: Record<string, string> = {}) {
  if (!path || path.endsWith('null') || path.endsWith('undefined')) {
    console.error(`Attempted to fetch from Deezer with an invalid path: ${path}`);
    return { error: { message: 'Invalid ID provided' } };
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
    
    if (data.error || (typeof data === 'object' && data !== null && !Array.isArray(data) && Object.keys(data).length === 0)) {
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
