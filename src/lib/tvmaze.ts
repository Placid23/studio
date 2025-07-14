
import type { Show, Episode, Season } from './types';
import { stripHtml } from 'string-strip-html';

const BASE_URL = 'https://api.tvmaze.com';

async function fetchFromTVMaze(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
        next: { revalidate: 3600 } // Revalidate every hour
    });
    if (!response.ok) {
      console.error(`TVMaze API error for path ${path}: ${response.statusText}`);
       if (typeof window !== 'undefined') {
        throw new Error(`Failed to fetch from TVMaze: ${response.statusText}`);
      }
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch from TVMaze path ${path}:`, error);
     if (typeof window !== 'undefined') {
        throw error;
      }
    return null;
  }
}

function mapTvMazeToShow(tvmazeShow: any): Show {
    return {
        id: String(tvmazeShow.id),
        type: 'show',
        source: 'tvmaze',
        title: tvmazeShow.name,
        year: tvmazeShow.premiered ? new Date(tvmazeShow.premiered).getFullYear() : 0,
        genres: tvmazeShow.genres || [],
        rating: tvmazeShow.rating?.average || 0,
        synopsis: tvmazeShow.summary ? stripHtml(tvmazeShow.summary).result : 'No synopsis available.',
        posterUrl: tvmazeShow.image?.medium || 'https://placehold.co/500x750.png',
        backdropUrl: tvmazeShow.image?.original || 'https://placehold.co/1280x720.png',
        trailerUrl: tvmazeShow.externals?.youtube ? `https://www.youtube.com/embed/${tvmazeShow.externals.youtube}` : undefined,
        cast: tvmazeShow._embedded?.cast?.map((c: any) => c.person.name).slice(0,10) || [],
        seasons: tvmazeShow._embedded?.seasons?.map((s: any) => ({
            id: String(s.id),
            name: s.name || `Season ${s.number}`,
            season_number: s.number,
            episode_count: s.episodeOrder || 0,
            poster_path: s.image?.medium,
        })) || []
    };
}

export async function getPopularShows(): Promise<Show[]> {
    const data = await fetchFromTVMaze('/shows');
    if (!data) return [];
    return data.slice(0, 20).map(mapTvMazeToShow);
}


export async function getShowDetails(id: string): Promise<Show | null> {
    const data = await fetchFromTVMaze(`/shows/${id}`, { embed: ['cast', 'seasons'] });
    if (!data) return null;
    return mapTvMazeToShow(data);
}

export async function getEpisodesForSeason(showId: string, seasonNumber: number): Promise<Episode[]> {
    const data: any[] = await fetchFromTVMaze(`/shows/${showId}/episodes`);
    if (!data) return [];
    
    const seasonEpisodes = data.filter(ep => ep.season === seasonNumber);

    return seasonEpisodes.map((ep: any) => ({
        id: String(ep.id),
        name: ep.name,
        season_number: ep.season,
        episode_number: ep.number,
        synopsis: ep.summary ? stripHtml(ep.summary).result : 'No synopsis available.',
        still_path: ep.image?.medium || 'https://placehold.co/500x281.png',
    }));
}


export async function searchShows(query: string): Promise<Show[]> {
    const data = await fetchFromTVMaze('/search/shows', { q: query });
    if (!data) return [];
    return data.map((item: any) => mapTvMazeToShow(item.show));
}

export async function getTopRatedShows(): Promise<Show[]> {
    const allShows = await getPopularShows();
    return allShows.sort((a, b) => b.rating - a.rating);
}
