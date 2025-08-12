
'use client';

import { useMusicPlayer } from '@/components/providers/MusicProvider';
import { ImageLoader } from './ImageLoader';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
    const { 
        currentTrack, 
        isPlaying, 
        togglePlayPause, 
        playNext, 
        playPrev,
        duration,
        currentTime,
        seek
    } = useMusicPlayer();

    if (!currentTrack) return null;

    const handleSeek = (value: number[]) => {
        seek(value[0]);
    };

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 h-24 bg-background/80 backdrop-blur-lg border-t z-50"
        >
            <div className="container mx-auto h-full flex items-center justify-between px-4">
                <div className="flex items-center gap-4 w-1/4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden img-container">
                        <ImageLoader src={currentTrack.cover_url!} alt={currentTrack.title} fill style={{objectFit: 'cover'}} data-ai-hint="album art" />
                    </div>
                    <div>
                        <p className="font-bold text-lg truncate">{currentTrack.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 w-1/2">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={playPrev}>
                            <SkipBack />
                        </Button>
                        <Button variant="default" size="icon" className="w-12 h-12 rounded-full" onClick={togglePlayPause}>
                            {isPlaying ? <Pause className="fill-background" /> : <Play className="fill-background" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={playNext}>
                            <SkipForward />
                        </Button>
                    </div>
                     <div className="w-full flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <Slider
                            value={[currentTime]}
                            max={duration}
                            step={1}
                            onValueChange={handleSeek}
                            className="flex-1"
                        />
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="w-1/4" />
            </div>
        </motion.div>
    );
}
