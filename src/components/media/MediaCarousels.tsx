

import { MediaCarousel } from '@/components/media/MediaCarousel';
import { getPopularMovies, getTopRatedMovies, getPopularShows, getTopRatedShows, getUpcomingMovies, getEroticMovies, getPopularAnime } from '@/lib/tmdb';
import { deezerGet } from '@/lib/deezer';
import { MusicCarousel } from './MusicCarousel';

export async function MediaCarousels() {
  const [
    popularMovies,
    topRatedMovies,
    popularShows,
    topRatedShows,
    upcomingMovies,
    eroticMovies,
    popularAnime,
    topTracks,
    christianMusicData
  ] = await Promise.all([
    getPopularMovies(),
    getTopRatedMovies(),
    getPopularShows(),
    getTopRatedShows(),
    getUpcomingMovies(),
    getEroticMovies(),
    getPopularAnime(),
    deezerGet('chart/0/tracks', { limit: '20' }),
    deezerGet('playlist/1116114261/tracks', {limit: '20'}), // Deezer's "Christian & Gospel" playlist
  ]);

  return (
    <>
      <MediaCarousel title="New to Novastream" media={upcomingMovies.results} />
      <MediaCarousel title="Popular Movies" media={popularMovies.results} />
      <MediaCarousel title="Top Rated Movies" media={topRatedMovies.results} />
      <MediaCarousel title="Popular TV Shows" media={popularShows.results} />
      <MediaCarousel title="Top Rated TV Shows" media={topRatedShows.results} />
      <MediaCarousel title="Popular Anime" media={popularAnime.results} />
      <MusicCarousel title="Top Music" items={topTracks?.data || []} />
      <MusicCarousel title="Christian Music" items={christianMusicData?.data || []} />
      <MediaCarousel title="Adult 18+ Movies" media={eroticMovies.results} />
    </>
  );
}
