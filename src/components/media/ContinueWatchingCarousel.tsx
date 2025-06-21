'use client';

import { useEffect, useState } from 'react';
import { MediaCarousel } from './MediaCarousel';
import { useWatchHistory } from '@/hooks/use-watch-history';

export function ContinueWatchingCarousel() {
  const { history } = useWatchHistory();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !history || history.length === 0) {
    return null;
  }

  return <MediaCarousel title="Continue Watching" media={history} />;
}
