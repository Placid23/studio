
import { MediaCarousel } from '@/components/media/MediaCarousel';
import { getPopularMovies, getTopRatedMovies, getPopularShows, getTopRatedShows, getUpcomingMovies } from '@/lib/tmdb';

export async function MediaCarousels() {
  const [
    popularMoviesData,
    topRatedMoviesData,
    popularShowsData,
    topRatedShowsData,
    upcomingMoviesData
  ] = await Promise.all([
    getPopularMovies(),
    getTopRatedMovies(),
    getPopularShows(),
    getTopRatedShows(),
    getUpcomingMovies()
  ]);

  return (
    <>
      <MediaCarousel title="New to Novastream" media={upcomingMoviesData} />
      <MediaCarousel title="Popular Movies" media={popularMoviesData} />
      <MediaCarousel title="Top Rated Movies" media={topRatedMoviesData} />
      <MediaCarousel title="Popular TV Shows" media={popularShowsData} />
      <MediaCarousel title="Top Rated TV Shows" media={topRatedShowsData} />
    </>
  );
}
