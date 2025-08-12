
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Track, LikedSong } from '@/lib/types';
import { useToast } from './use-toast';

const LIKED_SONGS_KEY = 'novastream-liked-songs';

export function useLikedSongs() {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const { toast } = useToast();

  const getLikedSongs = useCallback((): LikedSong[] => {
    try {
      const stored = localStorage.getItem(LIKED_SONGS_KEY);
      if (stored) {
        return JSON.parse(stored) as LikedSong[];
      }
    } catch (error) {
      console.error("Could not get liked songs from localStorage", error);
    }
    return [];
  }, []);

  useEffect(() => {
    const songs = getLikedSongs().sort((a, b) => b.likedAt - a.likedAt);
    setLikedSongs(songs);
  }, [getLikedSongs]);

  const isLiked = useCallback((trackId: number) => {
    return likedSongs.some(song => song.id === trackId);
  }, [likedSongs]);

  const toggleLike = useCallback((track: Track) => {
    try {
      const currentLiked = getLikedSongs();
      const existingIndex = currentLiked.findIndex(t => t.id === track.id);
      let newLiked: LikedSong[];
      
      if (existingIndex > -1) {
        // Unlike the song
        newLiked = currentLiked.filter(t => t.id !== track.id);
        toast({
            title: 'Removed from Liked Songs',
            description: `"${track.title}" has been removed from your liked songs.`,
        });
      } else {
        // Like the song
        const newSong: LikedSong = {
          ...track,
          type: 'track', // Ensure type is explicitly set
          likedAt: Date.now(),
        };
        newLiked = [newSong, ...currentLiked].slice(0, 50); // Limit to 50 liked songs
        toast({
            title: 'Added to Liked Songs',
            description: `"${track.title}" has been added to your liked songs.`,
        });
      }
      
      localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(newLiked));
      setLikedSongs(newLiked.sort((a, b) => b.likedAt - a.likedAt));

    } catch (error) {
      console.error("Could not update liked songs in localStorage", error);
       toast({
            title: 'Error',
            description: `Could not update your liked songs.`,
            variant: 'destructive',
       });
    }
  }, [getLikedSongs, toast]);

  return { likedSongs, isLiked, toggleLike };
}
