
'use client';

/**
 * @fileOverview API utility for communicating with the Flask streaming backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export interface Quality {
  index: number;
  resolution: string;
  format: string;
  size: string;
}

export interface OptionsResponse {
  type: "movie" | "series";
  qualities?: Quality[];
  seasons?: string[];
  episodes?: string[];
  error?: string;
}

export interface ResolveResponse {
  url: string;
  quality: string;
  error?: string;
}

/**
 * Fetch available options (seasons/episodes or qualities) for a title.
 */
export async function fetchOptions(
  title: string,
  type: "movie" | "series" | "auto" = "auto"
): Promise<OptionsResponse> {
  const res = await fetch(`${API_URL}/options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, type }),
  });
  if (!res.ok) throw new Error(`Options failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch episodes for a specific season.
 */
export async function fetchEpisodes(
  title: string,
  season: string
): Promise<{ episodes: string[]; error?: string }> {
  const res = await fetch(`${API_URL}/episodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, season }),
  });
  if (!res.ok) throw new Error(`Episodes failed: ${res.status}`);
  return res.json();
}

/**
 * Resolve the final download/stream URL for a specific quality and episode.
 */
export async function resolveDownload(params: {
  title: string;
  type: "movie" | "series";
  quality: string;
  season?: string;
  episode?: string;
}): Promise<ResolveResponse> {
  const res = await fetch(`${API_URL}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Resolve failed: ${res.status}`);
  return res.json();
}

/**
 * Get a proxied stream URL for a video file.
 */
export function getStreamUrl(downloadUrl: string): string {
  return `${API_URL}/stream?url=${encodeURIComponent(downloadUrl)}`;
}
