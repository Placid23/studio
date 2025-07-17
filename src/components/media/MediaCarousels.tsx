
import { MediaCarousel } from '@/components/media/MediaCarousel';
import { getPopularMovies, getTopRatedMovies, getPopularShows, getTopRatedShows } from '@/lib/tmdb';

export async function MediaCarousels() {
  const [
    popularMoviesData,
    topRatedMoviesData,
    popularShowsData,
    topRatedShowsData,
  ] = await Promise.all([
    getPopularMovies(),
    getTopRatedMovies(),
    getPopularShows(),
    getTopRatedShows(),
  ]);

  return (
    <>
      <MediaCarousel title="Popular Movies" media={popularMoviesData} />
      <MediaCarousel title="Top Rated Movies" media={topRatedMoviesData} />
      <MediaCarousel title="Popular TV Shows" media={popularShowsData} />
      <MediaCarousel title="Top Rated TV Shows" media={topRatedShowsData} />
    </>
  );
}
