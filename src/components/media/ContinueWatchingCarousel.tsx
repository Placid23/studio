
'use client';

import { useEffect, useState } from 'react';
import { MediaCarousel } from './MediaCarousel';
import { useWatchHistory } from '@/hooks/use-watch-history';

export function ContinueWatchingCarousel() {
  const { history, removeFromWatchHistory } = useWatchHistory();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !history || history.length === 0) {
    return null;
  }
  
  const handleRemove = (id: string) => {
      const itemToRemove = history.find(item => item.id === id);
      if (itemToRemove) {
          removeFromWatchHistory(itemToRemove.id);
      }
  }

  return <MediaCarousel title="Continue Watching" media={history} onRemoveItem={handleRemove} />;
}
