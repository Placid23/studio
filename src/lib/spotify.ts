
'use server';
import './env';
import { Buffer } from 'buffer';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const API_ENDPOINT = `https://api.spotify.com/v1`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn("Spotify API credentials are not set. New releases will not be fetched.");
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
            next: { revalidate: 3500 } // Revalidate slightly before expiry
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Failed to get Spotify access token:', errorBody);
            throw new Error(`Spotify token error: ${response.statusText}`);
        }

        const data = await response.json();
        const expiresIn = data.expires_in * 1000; // convert to milliseconds
        
        accessToken = {
            token: data.access_token,
            expiresAt: Date.now() + expiresIn,
        };
        
        return accessToken.token;

    } catch (error) {
        console.error('Error fetching Spotify token:', error);
        return null;
    }
};

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

export async function getNewReleases(): Promise<SpotifyTrack[]> {
    const token = await getAccessToken();
    if (!token) {
        return [];
    }

    try {
        const response = await fetch(`${API_ENDPOINT}/browse/new-releases?country=US&limit=20`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            next: { revalidate: 3600 } // Cache new releases for an hour
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Failed to fetch new releases from Spotify:', errorBody);
            throw new Error(`Spotify API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.albums.items;

    } catch (error) {
        console.error('Error fetching new releases from Spotify:', error);
        return [];
    }
}
