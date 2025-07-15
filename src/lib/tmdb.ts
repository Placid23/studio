
import type { Movie, Show, Episode, Season } from './types';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

async function fetchFromTMDB(path: string, params: Record<string, string> = {}) {
  if (!API_KEY) {
    // This check is primarily for server-side logs. Client-side will show the UI error.
    console.error('TMDB_API_KEY environment variable is not set');
    // In client-side components, we should throw to let react-query handle it.
    if (typeof window !== 'undefined') {
      throw new Error('TMDB_API_KEY is not configured.');
    }
    return null;
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.append('api_key', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
        next: { revalidate: 3600 } // Revalidate every hour
    });
    if (!response.ok) {
      console.error(`TMDB API error for path ${path}: ${response.statusText}`);
      if (typeof window !== 'undefined') {
        throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
      }
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch from TMDB path ${path}:`, error);
     if (typeof window !== 'undefined') {
        throw error;
      }
    return null;
  }
}

export const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500') => {
    return path ? `${IMAGE_BASE_URL}${size}${path}` : 'https://placehold.co/500x750.png';
}

function mapTmdbToMovie(tmdbMovie: any): Movie {
    const trailer = tmdbMovie.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
    return {
        id: String(tmdbMovie.id),
        type: 'movie',
        title: tmdbMovie.title,
        year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 0,
        genres: tmdbMovie.genres?.map((g: any) => g.name) || [],
        rating: tmdbMovie.vote_average || 0,
        synopsis: tmdbMovie.overview,
        posterUrl: getImageUrl(tmdbMovie.poster_path, 'w500'),
        backdropUrl: getImageUrl(tmdbMovie.backdrop_path, 'w1280'),
        duration: tmdbMovie.runtime,
        cast: tmdbMovie.credits?.cast.slice(0, 10).map((c: any) => c.name),
        director: tmdbMovie.credits?.crew.find((c: any) => c.job === 'Director')?.name,
        trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : undefined
    };
}

function mapTmdbToShow(tmdbShow: any): Show {
    const trailer = tmdbShow.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
    return {
        id: String(tmdbShow.id),
        type: 'show',
        title: tmdbShow.name,
        year: tmdbShow.first_air_date ? new Date(tmdbShow.first_air_date).getFullYear() : 0,
        genres: tmdbShow.genres?.map((g: any) => g.name) || [],
        rating: tmdbShow.vote_average || 0,
        synopsis: tmdbShow.overview,
        posterUrl: getImageUrl(tmdbShow.poster_path, 'w500'),
        backdropUrl: getImageUrl(tmdbShow.backdrop_path, 'w1280'),
        cast: tmdbShow.credits?.cast.slice(0, 10).map((c: any) => c.name),
        trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : undefined,
        seasons: tmdbShow.seasons?.map((s:any) => ({
            id: String(s.id),
            name: s.name,
            season_number: s.season_number,
            episode_count: s.episode_count,
            poster_path: s.poster_path,
        })) || []
    };
}


export async function getTrending(mediaType: 'movie' | 'tv' = 'movie'): Promise<(Movie | Show)[]> {
  const data = await fetchFromTMDB(`/trending/${mediaType}/week`);
  if (!data?.results) return [];
  // Ensure we only return the correct media type, TMDB search can be fuzzy
  return data.results
    .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv'))
    .map((item: any) => {
        if (item.media_type === 'movie') return mapTmdbToMovie(item);
        if (item.media_type === 'tv') return mapTmdbToShow(item);
        return null;
    }).filter(Boolean) as (Movie | Show)[];
}

export async function getPopularMovies(region?: string): Promise<Movie[]> {
    const params = region ? { region } : {};
    const data = await fetchFromTMDB('/movie/popular', params);
    if (!data?.results) return [];
    return data.results.map(mapTmdbToMovie);
}

export async function getTopRatedMovies(): Promise<Movie[]> {
    const data = await fetchFromTMDB('/movie/top_rated');
    if (!data?.results) return [];
    return data.results.map(mapTmdbToMovie);
}

export async function getUpcomingMovies(): Promise<Movie[]> {
    const data = await fetchFromTMDB('/movie/upcoming');
    if (!data?.results) return [];
    return data.results.map(mapTmdbToMovie);
}

export async function getPopularShows(region?: string): Promise<Show[]> {
    const params = region ? { region } : {};
    const data = await fetchFromTMDB('/tv/popular', params);
    if (!data?.results) return [];
    return data.results.map(mapTmdbToShow);
}

export async function getTopRatedShows(): Promise<Show[]> {
    const data = await fetchFromTMDB('/tv/top_rated');
    if (!data?.results) return [];
    return data.results.map(mapTmdbToShow);
}


export async function getMovieDetails(id: string): Promise<Movie | null> {
  const data = await fetchFromTMDB(`/movie/${id}`, { append_to_response: 'videos,credits' });
  if (!data) return null;
  return mapTmdbToMovie(data);
}

export async function getShowDetails(id: string): Promise<Show | null> {
  const data = await fetchFromTMDB(`/tv/${id}`, { append_to_response: 'videos,credits' });
  if (!data) return null;
  return mapTmdbToShow(data);
}

export async function getSeasonDetails(showId: string, seasonNumber: number): Promise<Episode[]> {
    const data = await fetchFromTMDB(`/tv/${showId}/season/${seasonNumber}`);
    if (!data?.episodes) return [];
    return data.episodes.map((ep: any) => ({
        id: String(ep.id),
        name: ep.name,
        season_number: ep.season_number,
        episode_number: ep.episode_number,
        synopsis: ep.overview,
        still_path: getImageUrl(ep.still_path, 'w500'),
    }));
}

export async function getSimilarMovies(id: string): Promise<Movie[]> {
    const data = await fetchFromTMDB(`/movie/${id}/similar`);
    if (!data?.results) return [];
    return data.results.slice(0, 10).map(mapTmdbToMovie);
}

export async function getSimilarShows(id: string): Promise<Show[]> {
    const data = await fetchFromTMDB(`/tv/${id}/similar`);
    if (!data?.results) return [];
    return data.results.slice(0, 10).map(mapTmdbToShow);
}

export async function searchMedia(query: string): Promise<(Movie | Show)[]> {
    const data = await fetchFromTMDB('/search/multi', { query });
    if (!data?.results) return [];
    
    return data.results
        .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
        .map((item: any) => {
            return item.media_type === 'movie' ? mapTmdbToMovie(item) : mapTmdbToShow(item);
        });
}

export async function getAvailableGenres(mediaType: 'movie' | 'tv'): Promise<{id: number, name: string}[]> {
    const data = await fetchFromTMDB(`/genre/${mediaType}/list`);
    return data?.genres || [];
}
