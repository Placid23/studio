
'use client';

import { useState, useTransition, useEffect } from 'react';
import type { SearchedTrack } from '@/lib/musicbrainz';
import { getNewReleasesAction, addMusicTrackAction } from './actions';
import { Button } from '@/components/ui/button';
import { Music, Loader2, PlusCircle, Library, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageLoader } from '@/components/media/ImageLoader';
import { BackButton } from '@/components/layout/BackButton';
import Link from 'next/link';

export default function MusicSearchPage() {
  const [results, setResults] = useState<SearchedTrack[]>([]);
  const [isLoading, startLoadingTransition] = useTransition();
  const [isAdding, startAddingTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    startLoadingTransition(async () => {
      const newReleases = await getNewReleasesAction();
      setResults(newReleases);
    });
  }, []);

  const handleAddTrack = (track: SearchedTrack) => {
    startAddingTransition(async () => {
      const result = await addMusicTrackAction(track);
      toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
       <BackButton />
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-black text-primary uppercase tracking-wider">New Releases on Spotify</h1>
         <p className="text-muted-foreground">Fresh tracks, enriched with data from MusicBrainz.</p>
         <Button asChild variant="outline">
            <Link href="/library">
                <Library className="mr-2" />
                Go to My Library
            </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="mt-6 text-2xl font-bold">Fetching New Releases...</h2>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((track) => (
            <div
              key={track.mbid}
              className="flex items-center p-3 rounded-lg transition-colors bg-card/50 hover:bg-secondary"
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden img-container mr-4">
                <ImageLoader src={track.coverUrl!} alt={track.album || 'album cover'} fill style={{ objectFit: 'cover' }} data-ai-hint="album art" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{track.title}</p>
                <p className="text-sm text-muted-foreground">{track.artist} - <span className="italic">{track.album}</span></p>
              </div>
              <Button onClick={() => handleAddTrack(track)} disabled={isAdding}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add to Library
              </Button>
            </div>
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
          <Music className="w-16 h-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-bold">Could Not Fetch New Releases</h2>
          <p className="mt-2 text-muted-foreground">Please ensure your Spotify credentials are set correctly in the .env file.</p>
        </div>
      )}
    </div>
  );
}
