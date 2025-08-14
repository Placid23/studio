
import { MediaCarousel } from '@/components/media/MediaCarousel';
import { getPopularMovies, getTopRatedMovies, getPopularShows, getTopRatedShows, getUpcomingMovies } from '@/lib/tmdb';

export async function MediaCarousels() {
  const [
    popularMovies,
    topRatedMovies,
    popularShows,
    topRatedShows,
    upcomingMovies
  ] = await Promise.all([
    getPopularMovies(),
    getTopRatedMovies(),
    getPopularShows(),
    getTopRatedShows(),
    getUpcomingMovies()
  ]);

  return (
    <>
      <MediaCarousel title="New to Novastream" media={upcomingMovies.results} />
      <MediaCarousel title="Popular Movies" media={popularMovies.results} />
      <MediaCarousel title="Top Rated Movies" media={topRatedMovies.results} />
      <MediaCarousel title="Popular TV Shows" media={popularShows.results} />
      <MediaCarousel title="Top Rated TV Shows" media={topRatedShows.results} />
    </>
  );
}
