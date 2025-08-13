
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

export function AudioPlayer({ tracks, autoPlay = false }: { tracks: Track[], autoPlay?: boolean }) {
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(autoPlay ? 0 : null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0);
    const [videoTrack, setVideoTrack] = useState<Track | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const intervalRef = useRef<NodeJS.Timeout>();

    const { isLiked, toggleLike } = useLikedSongs();

    const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

    useEffect(() => {
        if (autoPlay && tracks.length > 0) {
            setCurrentTrackIndex(0);
            setIsPlaying(true);
        }
    }, [autoPlay, tracks]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying && currentTrack?.preview) {
            if (audio.src !== currentTrack.preview) {
                audio.src = currentTrack.preview;
            }
            audio.play().catch(e => console.error("Error playing audio", e));

            intervalRef.current = setInterval(() => {
                if (audio.duration) {
                    setProgress((audio.currentTime / audio.duration) * 100);
                }
            }, 1000);
        } else {
            audio.pause();
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, currentTrack]);

    const handlePlayPause = (index: number) => {
        const track = tracks[index];
        if (!track || !track.preview) return; 

        if (index === currentTrackIndex) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentTrackIndex(index);
            setIsPlaying(true);
            setProgress(0);
        }
    };

    const handleScrub = (value: number[]) => {
        if (audioRef.current?.duration) {
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
                    const hasPreview = !!track.preview;
                    return (
                        <div key={track.id} className="flex items-center p-3 rounded-lg bg-card/50 hover:bg-card transition-colors group">
                            <Button variant="ghost" size="icon" onClick={() => handlePlayPause(index)} disabled={!hasPreview}>
                                {currentTrackIndex === index && isPlaying ? <Pause className="h-5 w-5" /> : <Play className={`h-5 w-5 ${!hasPreview ? 'text-muted-foreground/50' : ''}`} />}
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
                            {track.type === 'track' && ( // Only show like button for actual tracks
                                <Button variant="ghost" size="icon" onClick={() => toggleLike(track)} className="ml-2">
                                    <Heart className={`h-5 w-5 ${liked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                                </Button>
                            )}
                            {track.duration > 0 && (
                                <span className="ml-4 text-sm text-muted-foreground w-16 text-right">
                                    {formatDuration(track.duration)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
