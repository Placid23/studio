
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { Track, LikedSong } from '@/lib/types';
import { useToast } from './use-toast';
import { getLikedSongsAction, toggleLikeAction } from '@/app/music/actions';

export function useLikedSongs(initialSongs: LikedSong[] = []) {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>(initialSongs);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial liked songs on mount
    getLikedSongsAction().then(songs => {
        setLikedSongs(songs);
    });
  }, []);

  const isLiked = useCallback((trackId: number) => {
    return likedSongs.some(song => song.id === trackId);
  }, [likedSongs]);

  const toggleLike = useCallback((track: Track) => {
    startTransition(async () => {
      // Optimistically update the UI
      const alreadyLiked = isLiked(track.id);
      if (alreadyLiked) {
        setLikedSongs(prev => prev.filter(s => s.id !== track.id));
      } else {
        const newLikedSong: LikedSong = { ...track, type: 'track', likedAt: Date.now() };
        setLikedSongs(prev => [newLikedSong, ...prev]);
      }
      
      const result = await toggleLikeAction(track);

      toast({
        title: result.success ? (result.isLiked ? 'Song Liked' : 'Song Unliked') : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      
      // If the optimistic update was wrong, revert it by re-fetching from the server
      if (!result.success) {
         getLikedSongsAction().then(songs => {
            setLikedSongs(songs);
        });
      }
    });
  }, [isLiked, toast]);

  return { likedSongs, isLiked, toggleLike, isLoading: isPending };
}
