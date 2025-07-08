import { getSimilarMovies, getSimilarShows } from '@/lib/tmdb';
import { MediaCarousel } from './MediaCarousel';

interface SimilarMediaProps {
  mediaId: string;
  mediaType: 'movie' | 'show';
}

export async function SimilarMedia({ mediaId, mediaType }: SimilarMediaProps) {
  const similarMedia = mediaType === 'movie' 
    ? await getSimilarMovies(mediaId) 
    : await getSimilarShows(mediaId);

  if (!similarMedia || similarMedia.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <MediaCarousel title="You Might Also Like" media={similarMedia} />
    </div>
  );
}
