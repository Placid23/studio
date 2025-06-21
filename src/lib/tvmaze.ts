'use server';

import type { Show, Episode } from './types';
import { stripHtml } from 'string-strip-html';
import { getTvShowTrailer } from './tmdb';

const API_BASE_URL = 'https://api.tvmaze.com';

interface TVMazeShow {
  id: number;
  name: string;
  premiered: string;
  genres: string[];
  rating: { average: number | null };
  summary: string | null;
  image: { medium: string; original: string } | null;
  _embedded?: {
    episodes: TVMazeEpisode[];
    cast: TVMazeCastCharacter[];
  };
  externals: {
    imdb: string | null;
  };
}

interface TVMazeEpisode {
    id: number;
    name: string;
    season: number;
    number: number;
    runtime: number;
    summary: string | null;
    image: { medium: string; original: string } | null;
}

interface TVMazeCastCharacter {
  person: {
    name: string;
  };
}

interface TVMazeSearchResult {
  score: number;
  show: TVMazeShow;
}


async function fetchFromTVMaze<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Revalidate cache every hour
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Failed to fetch from TVMaze: ${error.message || res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`TVMaze fetch error for endpoint ${endpoint}:`, error);
    throw error;
  }
}

function mapTVMazeShowToShow(show: TVMazeShow): Show {
  return {
    type: 'show',
    id: String(show.id),
    title: show.name,
    year: show.premiered ? new Date(show.premiered).getFullYear() : 0,
    genres: show.genres || [],
    rating: show.rating.average || 0,
    synopsis: show.summary ? stripHtml(show.summary).result : 'No synopsis available.',
    posterUrl: show.image?.medium.replace('http://', 'https://') || 'https://placehold.co/210x295.png',
    backdropUrl: show.image?.original.replace('http://', 'https://') || 'https://placehold.co/1920x1080.png',
    episodes: show._embedded?.episodes.map(mapTVMazeEpisodeToEpisode),
    cast: show._embedded?.cast?.map(c => c.person.name).slice(0, 10),
  };
}

function mapTVMazeEpisodeToEpisode(episode: TVMazeEpisode): Episode {
    return {
        id: episode.id,
        name: episode.name,
        season: episode.season,
        number: episode.number,
        runtime: episode.runtime,
        summary: episode.summary ? stripHtml(episode.summary).result : 'No summary available.',
        imageUrl: episode.image?.medium.replace('http://', 'https://') || 'https://placehold.co/400x225.png',
    }
}

export async function getPopularShows(): Promise<Show[]> {
  try {
    const data = await fetchFromTVMaze<TVMazeShow[]>('shows');
    // Sort by rating and return top 20
    return data
      .filter(s => s.rating.average)
      .sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0))
      .slice(0, 20)
      .map(mapTVMazeShowToShow);
  } catch (error) {
    console.error('getPopularShows error:', error);
    return [];
  }
}

export async function getShowsByQuery(query: string): Promise<Show[]> {
  try {
    const data = await fetchFromTVMaze<TVMazeSearchResult[]>(`search/shows?q=${encodeURIComponent(query)}`);
    return data
      .slice(0, 20)
      .map(result => mapTVMazeShowToShow(result.show));
  } catch (error) {
    console.error(`getShowsByQuery for "${query}" error:`, error);
    return [];
  }
}

export async function getShowDetails(id: string): Promise<Show | null> {
    try {
        const showData = await fetchFromTVMaze<TVMazeShow>(`shows/${id}?embed[]=episodes&embed[]=cast`);
        const show = mapTVMazeShowToShow(showData);

        if (showData.externals.imdb) {
          show.trailerUrl = await getTvShowTrailer(showData.externals.imdb);
        }

        return show;
    } catch (error) {
        console.error(`Error fetching details for show ${id}:`, error);
        return null;
    }
}
