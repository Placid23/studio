
'use client';

import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { PlayableTrack } from '@/lib/types';
import { MusicPlayer } from '@/components/media/MusicPlayer';
import { AnimatePresence } from 'framer-motion';

interface MusicContextType {
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  playTrack: (track: PlayableTrack, trackList: PlayableTrack[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = useState<PlayableTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const playTrack = useCallback((track: PlayableTrack, trackList: PlayableTrack[]) => {
    setPlaylist(trackList);
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (currentTrack) {
        setIsPlaying(prev => !prev);
    }
  }, [currentTrack]);
  
  const playNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  }, [currentTrack, playlist]);

  const playPrev = useCallback(() => {
      if (!currentTrack || playlist.length === 0) return;
      const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
  }, [currentTrack, playlist]);

  const seek = (time: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => playNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
    };
  }, [playNext]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
        if (isPlaying) {
            if(audioRef.current.src !== currentTrack.audioUrl) {
                audioRef.current.src = currentTrack.audioUrl;
            }
            audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [currentTrack, isPlaying]);


  const value = {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    playNext,
    playPrev,
    duration,
    currentTime,
    seek
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {currentTrack && <MusicPlayer />}
      </AnimatePresence>
    </MusicContext.Provider>
  );
}

export const useMusicPlayer = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicProvider');
  }
  return context;
};
