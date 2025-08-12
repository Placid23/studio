
import { Buffer } from 'buffer';

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0; // timestamp in ms

export async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) { // refresh 60s early
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in env');
  }

  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store'
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error('Failed to fetch Spotify token:', text);
    throw new Error('Failed to fetch Spotify token: ' + resp.status + ' ' + text);
  }

  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

export async function spotifyGet(endpoint: string, params: Record<string, any> = {}) {
  const token = await getAccessToken();
  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 } // Revalidate every hour
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Spotify API error for ${endpoint}:`, text);
    throw new Error(`Spotify API error ${res.status}: ${text}`);
  }
  return res.json();
}
