import { Skeleton } from '@/components/ui/skeleton';
import { MediaCarouselSkeleton } from '@/components/media/MediaCarousel';

export default function Loading() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px] w-full">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-16 w-full max-w-2xl">
          <Skeleton className="h-10 w-1/2 md:h-16 md:w-1/3 mb-4" />
          <Skeleton className="h-4 w-3/4 md:w-1/2 mb-2" />
          <Skeleton className="h-4 w-5/6 md:w-2/3 mb-4" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-11 w-28 rounded-md" />
            <Skeleton className="h-11 w-36 rounded-md" />
          </div>
        </div>
      </div>

      {/* Carousels Skeleton */}
      <div className="flex flex-col gap-12 md:gap-16 py-8 lg:py-12 px-4 md:px-16 -mt-16 md:-mt-24 relative z-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <MediaCarouselSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
