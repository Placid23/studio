
import { MediaCarousel } from '@/components/media/MediaCarousel';
import { getPopularMovies, getTopRatedMovies, getPopularShows, getTopRatedShows, getUpcomingMovies, getEroticMovies, getPopularAnime } from '@/lib/tmdb';
import { getChart } from '@/lib/deezer';
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
    christianMusic
  ] = await Promise.all([
    getPopularMovies(),
    getTopRatedMovies(),
    getPopularShows(),
    getTopRatedShows(),
    getUpcomingMovies(),
    getEroticMovies(),
    getPopularAnime(),
    getChart('tracks'),
    getChart('albums', 100).then(albums => albums.filter((a: any) => a.genres?.data?.some((g:any) => g.name.includes('Christian'))).slice(0, 20))
  ]);

  return (
    <>
      <MediaCarousel title="New to Novastream" media={upcomingMovies.results} />
      <MediaCarousel title="Popular Movies" media={popularMovies.results} />
      <MediaCarousel title="Top Rated Movies" media={topRatedMovies.results} />
      <MediaCarousel title="Popular TV Shows" media={popularShows.results} />
      <MediaCarousel title="Top Rated TV Shows" media={topRatedShows.results} />
      <MediaCarousel title="Popular Anime" media={popularAnime.results} />
      <MusicCarousel title="Top Music" items={topTracks} />
      <MusicCarousel title="Christian Music" items={christianMusic} />
      <MediaCarousel title="Adult 18+ Movies" media={eroticMovies.results} />
    </>
  );
}
