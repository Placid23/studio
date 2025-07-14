
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Movie, Show } from '@/lib/types';

type WatchHistoryItem = (Movie | Show) & { watchedAt: number };

const HISTORY_KEY = 'novastream-watch-history';

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  const getWatchHistory = useCallback((): WatchHistoryItem[] => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        return JSON.parse(storedHistory) as WatchHistoryItem[];
      }
    } catch (error) {
      console.error("Could not get watch history from localStorage", error);
    }
    return [];
  }, []);

  const addToWatchHistory = useCallback((media: Movie | Show) => {
    try {
      const currentHistory = getWatchHistory();
      // Remove if it already exists to avoid duplicates and move it to the front
      const updatedHistory = currentHistory.filter(item => item.id !== media.id);
      
      const newItem: WatchHistoryItem = {
        ...media,
        watchedAt: Date.now(),
      };
      
      // Add the new item to the beginning of the array and limit history size
      const newHistory = [newItem, ...updatedHistory].slice(0, 20);
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      
      // Update state if the hook needs to be reactive for the current page
      setHistory(newHistory);

    } catch (error) {
      console.error("Could not add to watch history in localStorage", error);
    }
  }, [getWatchHistory]);

  const removeFromWatchHistory = useCallback((mediaId: string) => {
    try {
      const currentHistory = getWatchHistory();
      const newHistory = currentHistory.filter(item => item.id !== mediaId);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Could not remove from watch history in localStorage", error);
    }
  }, [getWatchHistory]);


  useEffect(() => {
    const sortedHistory = getWatchHistory().sort((a, b) => b.watchedAt - a.watchedAt);
    setHistory(sortedHistory);
  }, [getWatchHistory]);

  return { history, addToWatchHistory, removeFromWatchHistory };
}
