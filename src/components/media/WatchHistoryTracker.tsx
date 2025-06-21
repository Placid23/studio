'use client';

import { useEffect } from 'react';
import { useWatchHistory } from '@/hooks/use-watch-history';
import type { Movie, Show } from '@/lib/types';

interface WatchHistoryTrackerProps {
  media: Movie | Show;
}

export function WatchHistoryTracker({ media }: WatchHistoryTrackerProps) {
  const { addToWatchHistory } = useWatchHistory();

  useEffect(() => {
    if (media) {
      addToWatchHistory(media);
    }
  }, [media, addToWatchHistory]);

  return null; // This component does not render anything
}
