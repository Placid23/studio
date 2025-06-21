import { getStreamingProviders } from '@/lib/justwatch';
import type { Movie, Show } from '@/lib/types';
import { ImageLoader } from './ImageLoader';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { ExternalLink } from 'lucide-react';

interface StreamingProvidersProps {
  media: Movie | Show;
}

export async function StreamingProviders({ media }: StreamingProvidersProps) {
  const providers = await getStreamingProviders(media.title, media.type, media.year);

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Where to Watch</h2>
      <div className="flex flex-wrap gap-4">
        {providers.map((provider) => (
          <Link href={provider.url} key={provider.name} target="_blank" rel="noopener noreferrer" className="group">
            <div className="flex items-center gap-3 rounded-lg bg-card/50 hover:bg-card p-3 border border-border transition-all duration-200 hover:border-primary">
              <div className="img-container h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                <ImageLoader
                  src={provider.iconUrl}
                  alt={`${provider.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                  data-ai-hint="streaming service logo"
                />
              </div>
              <div>
                <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{provider.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  Stream now
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StreamingProvidersSkeleton() {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-4 uppercase tracking-wider">Where to Watch</h2>
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-lg bg-card/50 p-3 border border-border" style={{width: '200px'}}>
             <Skeleton className="h-12 w-12 rounded-md" />
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
