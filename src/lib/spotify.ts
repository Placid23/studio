
'use server';

import { Buffer } from 'buffer';
import type { SearchedTrack } from './musicbrainz';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const API_ENDPOINT = `https://api.spotify.com/v1`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn("Spotify API credentials are not set. Music features may be limited.");
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

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    images: { url: string }[];
    owner: {
        display_name: string;
    }
}

export async function getNewReleases(): Promise<SpotifyAlbum[]> {
    const data = await spotifyFetch(`/browse/new-releases`, { country: 'US', limit: '20' });
    return data.albums.items;
}

export async function getFeaturedPlaylists(): Promise<SpotifyPlaylist[]> {
    const data = await spotifyFetch(`/browse/featured-playlists`, { country: 'US', limit: '10' });
    return data.playlists.items;
}

export async function getPlaylistTracks(playlistId: string): Promise<any[]> {
    const data = await spotifyFetch(`/playlists/${playlistId}/tracks`, { limit: '20' });
    return data.items;
}

export async function getArtistId(artistName: string): Promise<string | null> {
    const data = await spotifyFetch(`/search`, { q: artistName, type: 'artist', limit: '1' });
    return data.artists?.items[0]?.id || null;
}

export async function getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
    const data = await spotifyFetch(`/artists/${artistId}/top-tracks`, { country: 'US' });
    return data.tracks;
}
