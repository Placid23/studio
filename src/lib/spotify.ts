
import { Buffer } from 'buffer';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const API_ENDPOINT = `https://api.spotify.com/v1`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn("Spotify API credentials are not set in .env.local. Music features will be disabled.");
}

// In-memory cache for the access token
let accessToken: {
    token: string;
    expiresAt: number;
} | null = null;

const getAccessToken = async (): Promise<string | null> => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        return null;
    }
    
    if (accessToken && accessToken.expiresAt > Date.now()) {
        return accessToken.token;
    }

    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
            cache: 'no-store' // Do not cache the token request itself
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Failed to get Spotify access token:', { status: response.status, body: errorBody });
            throw new Error(`Spotify token error: ${response.statusText}`);
        }

        const data = await response.json();
        const expiresIn = data.expires_in * 1000; // convert to milliseconds
        
        accessToken = {
            token: data.access_token,
            expiresAt: Date.now() + expiresIn - (5 * 60 * 1000), // Refresh 5 mins before expiry
        };
        
        return accessToken.token;

    } catch (error) {
        console.error('Error fetching Spotify token:', error);
        throw error;
    }
};

async function spotifyFetch(endpoint: string, params: Record<string, string> = {}) {
    const token = await getAccessToken();
    if (!token) {
        throw new Error("Could not authenticate with Spotify.");
    }
    
    const url = new URL(`${API_ENDPOINT}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        next: { revalidate: 3600 } // Cache API responses for an hour
    });

    if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            errorBody = await response.text();
        }
        console.error(`Failed to fetch from Spotify endpoint ${endpoint}:`, { status: response.status, body: errorBody });
        throw new Error(`Spotify API error: ${response.statusText}`);
    }
    return response.json();
}

export interface SpotifyArtist {
    id: string;
    name: string;
}

export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

export interface SpotifyAlbum {
  album_type: string;
  total_tracks: number;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  artists: SpotifyArtist[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
}

export async function getNewReleases(): Promise<SpotifyAlbum[]> {
    const data = await spotifyFetch(`/browse/new-releases`, { country: 'US', limit: '20' });
    return data.albums.items;
}
