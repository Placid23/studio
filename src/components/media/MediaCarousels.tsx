import { MediaCarousel } from '@/components/media/MediaCarousel';
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getPopularShows, 
  getTopRatedShows, 
  getUpcomingMovies, 
  getEroticMovies, 
  getPopularAnime, 
  getKDramas 
} from '@/lib/tmdb';
import { deezerGet } from '@/lib/deezer';
import { MusicCarousel } from './MusicCarousel';

export async function UpcomingMoviesSection() {
  const data = await getUpcomingMovies();
  return <MediaCarousel title="New to Novastream" media={data.results} />;
}

export async function PopularMoviesSection() {
  const data = await getPopularMovies();
  return <MediaCarousel title="Popular Movies" media={data.results} />;
}

export async function KDramasSection() {
  const data = await getKDramas();
  return <MediaCarousel title="Trending K-Dramas" media={data.results} />;
}

export async function PopularShowsSection() {
  const data = await getPopularShows();
  return <MediaCarousel title="Popular TV Shows" media={data.results} />;
}

export async function TopRatedMoviesSection() {
  const data = await getTopRatedMovies();
  return <MediaCarousel title="Top Rated Movies" media={data.results} />;
}

export async function PopularAnimeSection() {
  const data = await getPopularAnime();
  return <MediaCarousel title="Popular Anime" media={data.results} />;
}

export async function TopTracksSection() {
  const data = await deezerGet('chart/0/tracks', { limit: '20' });
  return <MusicCarousel title="Top Music" items={data?.data || []} />;
}

export async function ChristianMusicSection() {
  const data = await deezerGet('playlist/1116114261/tracks', { limit: '20' });
  return <MusicCarousel title="Christian Music" items={data?.data || []} />;
}

export async function AdultMoviesSection() {
  const data = await getEroticMovies();
  return <MediaCarousel title="Adult 18+ Movies" media={data.results} />;
}
