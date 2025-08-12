
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import type { Track } from '@/lib/types';
import { Button } from '../ui/button';
import { Play, Pause, Heart, Music2, Youtube } from 'lucide-react';
import { Slider } from '../ui/slider';
import { useLikedSongs } from '@/hooks/use-liked-songs';
import { searchYoutubeVideo } from '@/app/music/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import YouTube from 'react-youtube';
import { Skeleton } from '../ui/skeleton';

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function VideoPlayerDialog({ track, open, onOpenChange }: { track: Track | null; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const [videoId, setVideoId] = useState<string | null>(null);
    const [isLoading, startTransition] = useTransition();

    useEffect(() => {
        if (open && track) {
            startTransition(async () => {
                const id = await searchYoutubeVideo(`${track.title} ${track.artist.name} official music video`);
                setVideoId(id);
            });
        }
    }, [open, track]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                    <DialogTitle>{track?.title} - {track?.artist.name}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video">
                {isLoading ? (
                    <Skeleton className="w-full h-full" />
                ) : videoId ? (
                    <YouTube videoId={videoId} className="w-full h-full" iframeClassName="w-full h-full" />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Could not find a video for this track.
                    </div>
                )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function AudioPlayer({ tracks }: { tracks: Track[] }) {
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [videoTrack, setVideoTrack] = useState<Track | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const intervalRef = useRef<NodeJS.Timeout>();

    const { isLiked, toggleLike } = useLikedSongs();

    const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play();
            intervalRef.current = setInterval(() => {
                if (audioRef.current) {
                    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                }
            }, 1000);
        } else {
            audioRef.current?.pause();
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, currentTrackIndex]);
    
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = currentTrack?.preview || '';
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Error playing audio", e));
            }
        }
    }, [currentTrack, isPlaying]);

    const handlePlayPause = (index: number) => {
        if (index === currentTrackIndex) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentTrackIndex(index);
            setIsPlaying(true);
        }
    };

    const handleScrub = (value: number[]) => {
        if (audioRef.current) {
            const newTime = (value[0] / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(value[0]);
        }
    }

    return (
        <>
            <VideoPlayerDialog track={videoTrack} open={!!videoTrack} onOpenChange={(isOpen) => !isOpen && setVideoTrack(null)} />
            <div className="space-y-2">
                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onLoadedMetadata={() => setProgress(0)} />
                {tracks.map((track, index) => {
                    const liked = isLiked(track.id);
                    return (
                        <div key={track.id} className="flex items-center p-3 rounded-lg bg-card/50 hover:bg-card transition-colors group">
                            <Button variant="ghost" size="icon" onClick={() => handlePlayPause(index)}>
                                {currentTrackIndex === index && isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>
                            <div className="ml-4 flex-grow">
                                <p className="font-semibold text-foreground">{track.title}</p>
                                <p className="text-sm text-muted-foreground">{track.artist.name}</p>
                            </div>
                            {currentTrackIndex === index && (
                                <div className="w-1/3 flex items-center gap-4 mx-4">
                                    <span className="text-xs text-muted-foreground">{formatDuration(audioRef.current?.currentTime || 0)}</span>
                                    <Slider
                                        value={[progress]}
                                        max={100}
                                        step={1}
                                        onValueChange={handleScrub}
                                        disabled={!isPlaying}
                                    />
                                    <span className="text-xs text-muted-foreground">{formatDuration(track.duration)}</span>
                                </div>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setVideoTrack(track)}>
                                <Youtube className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled className="ml-2 opacity-50 cursor-not-allowed">
                                <Music2 className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleLike(track)} className="ml-2">
                                <Heart className={`h-5 w-5 ${liked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                            </Button>
                            <span className="ml-4 text-sm text-muted-foreground w-16 text-right">
                                {formatDuration(track.duration)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
