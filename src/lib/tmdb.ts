import type { Movie } from './types';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  credits?: {
    cast: { name: string }[];
    crew: { job: string; name: string }[];
  };
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
      official: boolean;
    }[];
  };
}

interface Genre {
  id: number;
  name: string;
}

// Cache genres to avoid fetching them repeatedly on every server render in a single request.
let genreMap: Map<number, string> | null = null;

async function getGenreMap(): Promise<Map<number, string>> {
  if (genreMap) {
    return genreMap;
  }

  try {
    const data = await fetchFromTMDb<{ genres: Genre[] }>('genre/movie/list');
    genreMap = new Map(data.genres.map((g: Genre) => [g.id, g.name]));
    return genreMap;
  } catch (error) {
    console.error('getGenreMap error:', error);
    // Re-throw the error to be handled by the calling function (e.g., in the Page component)
    // This provides better error visibility in the UI.
    throw new Error('Failed to fetch genres');
  }
}

function mapTMDbMovieToMovie(movie: TMDbMovie, genres: Map<number, string>): Movie {
  const movieGenres = movie.genre_ids
    ? movie.genre_ids.map(id => genres.get(id)).filter(Boolean) as string[]
    : movie.genres?.map(g => g.name) || [];

  const officialTrailer = movie.videos?.results.find(
    video => video.site === 'YouTube' && video.type === 'Trailer' && video.official
  );
  const anyTrailer = movie.videos?.results.find(
    video => video.site === 'YouTube' && video.type === 'Trailer'
  );
  const trailerKey = officialTrailer?.key || anyTrailer?.key;

  return {
    type: 'movie',
    id: String(movie.id),
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    duration: movie.runtime,
    genres: movieGenres,
    genre_ids: movie.genre_ids,
    rating: movie.vote_average,
    synopsis: movie.overview,
    cast: movie.credits?.cast.slice(0, 10).map(c => c.name),
    director: movie.credits?.crew.find(c => c.job === 'Director')?.name,
    posterUrl: movie.poster_path
      ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
      : `https://placehold.co/500x750.png`,
    backdropUrl: movie.backdrop_path
      ? `${IMAGE_BASE_URL}/w1280${movie.backdrop_path}`
      : `https://placehold.co/1920x1080.png`,
    trailerUrl: trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : undefined,
  };
}

async function fetchFromTMDb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error('NEXT_PUBLIC_TMDB_API_KEY is not configured in .env file.');
  }
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // Revalidate cache every hour
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Failed to fetch from TMDb: ${error.status_message || res.statusText}`);
  }
  return res.json();
}

export async function getTrendingMovies(): Promise<Movie[]> {
  const genres = await getGenreMap();
  const data = await fetchFromTMDb<{ results: TMDbMovie[] }>('trending/movie/week');
  return data.results.map(movie => mapTMDbMovieToMovie(movie, genres));
}

export async function getMoviesByGenre(genreId: string): Promise<Movie[]> {
  const genres = await getGenreMap();
  const data = await fetchFromTMDb<{ results: TMDbMovie[] }>('discover/movie', { with_genres: genreId, sort_by: 'popularity.desc' });
  return data.results.map(movie => mapTMDbMovieToMovie(movie, genres));
}

export async function getMovieDetails(id: string): Promise<Movie | null> {
  // Prevent API calls for non-numeric IDs.
  if (isNaN(Number(id))) {
    return null;
  }
  try {
    const genres = await getGenreMap();
    const movie = await fetchFromTMDb<TMDbMovie>(`movie/${id}`, { append_to_response: 'credits,videos' });
    return mapTMDbMovieToMovie(movie, genres);
  } catch (error) {
    console.error(`Error fetching details for movie ${id}:`, error);
    return null;
  }
}

export async function getSimilarMovies(id: string): Promise<Movie[]> {
  const genres = await getGenreMap();
  const data = await fetchFromTMDb<{ results: TMDbMovie[] }>(`movie/${id}/similar`);
  return data.results.slice(0, 10).map(movie => mapTMDbMovieToMovie(movie, genres));
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const genres = await getGenreMap();
  const data = await fetchFromTMDb<{ results: TMDbMovie[] }>('search/movie', { query });
  return data.results.map(movie => mapTMDbMovieToMovie(movie, genres));
}

export async function discoverMovies(filters: { genre?: string, year?: string, rating?: string }): Promise<Movie[]> {
  const genres = await getGenreMap();
  const params: Record<string, string> = { sort_by: 'popularity.desc' };
  if (filters.genre && filters.genre !== 'all') params.with_genres = filters.genre;
  if (filters.year && filters.year !== 'all') params.primary_release_year = filters.year;
  if (filters.rating && filters.rating !== 'all') params['vote_average.gte'] = filters.rating;

  const data = await fetchFromTMDb<{ results: TMDbMovie[] }>('discover/movie', params);
  return data.results.map(movie => mapTMDbMovieToMovie(movie, genres));
}

export async function getTvShowTrailer(imdbId: string): Promise<string | undefined> {
  if (!imdbId) return undefined;
  
  try {
    const findResponse = await fetchFromTMDb<{ tv_results: { id: number }[] }>(
      `find/${imdbId}`,
      { external_source: 'imdb_id' }
    );

    const tmdbId = findResponse.tv_results?.[0]?.id;
    if (!tmdbId) {
      return undefined;
    }

    const videosResponse = await fetchFromTMDb<{ 
      results: { key: string; site: string; type: string; official: boolean }[] 
    }>(`tv/${tmdbId}/videos`);

    const officialTrailer = videosResponse.results.find(
      video => video.site === 'YouTube' && video.type === 'Trailer' && video.official
    );
    const anyTrailer = videosResponse.results.find(
      video => video.site === 'YouTube' && video.type === 'Trailer'
    );
    const trailerKey = officialTrailer?.key || anyTrailer?.key;

    return trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : undefined;

  } catch (error) {
    console.error(`Could not fetch trailer for IMDb ID ${imdbId}:`, error);
    return undefined;
  }
}

export async function getGenres(): Promise<Genre[]> {
  const genres = await getGenreMap();
  return Array.from(genres.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name));
}
