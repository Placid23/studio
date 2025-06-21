import { getPopularShows } from '@/lib/tvmaze';
import { MediaCard } from '@/components/media/MediaCard';

export default async function ShowsPage() {
  const shows = await getPopularShows();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-primary uppercase tracking-wider mb-8">
        Popular TV Shows
      </h1>
      {shows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {shows.map((show) => (
            <MediaCard key={show.id} media={show} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Could not load shows.</p>
        </div>
      )}
    </div>
  );
}
