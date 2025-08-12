
'use client';

import type { PlayableTrack } from '@/lib/types';
import { useMusicPlayer } from '@/components/providers/MusicProvider';
import { ImageLoader } from './ImageLoader';
import { Button } from '../ui/button';
import { Play, Pause, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MusicTrackListProps {
    tracks: PlayableTrack[];
}

export function MusicTrackList({ tracks }: MusicTrackListProps) {
    const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

    return (
        <div className="space-y-2">
            {tracks.map((track) => {
                const isActive = currentTrack?.id === track.id;
                return (
                    <div
                        key={track.id}
                        className={cn(
                            "flex items-center p-3 rounded-lg transition-colors group",
                            isActive ? 'bg-primary/10' : 'hover:bg-secondary'
                        )}
                    >
                        <div
                            className="relative w-16 h-16 rounded-md overflow-hidden cursor-pointer img-container mr-4"
                            onClick={() => playTrack(track, tracks)}
                        >
                            <ImageLoader src={track.cover_url!} alt={track.title} fill style={{objectFit: 'cover'}} data-ai-hint="album art" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                {isActive && isPlaying ? (
                                    <Pause className="w-8 h-8 text-white drop-shadow-lg" />
                                ) : (
                                    <Play className="w-8 h-8 text-white drop-shadow-lg" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1">
                            <p className="font-bold text-lg">{track.title}</p>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                        </div>

                        <div className="flex items-center gap-2">
                             <Button asChild variant="ghost" size="icon">
                                 <Link href={track.audioUrl} download={`${track.title}.mp3`}>
                                     <Download className="w-5 h-5" />
                                 </Link>
                             </Button>
                             <Button
                                variant={isActive ? 'default' : 'secondary'}
                                onClick={() => playTrack(track, tracks)}
                             >
                                {isActive && isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                                {isActive && isPlaying ? 'Pause' : 'Play'}
                             </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
