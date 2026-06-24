'use client';

import { useState, useTransition } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitRatingAction } from '@/app/actions/ratings';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RatingSystemProps {
    mediaId: string;
    initialUserRating: number;
    platformRating: number;
    totalRatings: number;
}

export function RatingSystem({ mediaId, initialUserRating, platformRating, totalRatings }: RatingSystemProps) {
    const [rating, setRating] = useState(initialUserRating);
    const [hover, setHover] = useState(0);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleRate = (value: number) => {
        if (isPending) return;
        setRating(value);
        startTransition(async () => {
            const result = await submitRatingAction(mediaId, value);
            toast({
                title: result.success ? "Rating Saved" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive"
            });
        });
    };

    return (
        <div className="flex flex-col gap-4 bg-card/40 backdrop-blur-md p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">NovaStream Rating</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-primary">{platformRating.toFixed(1)}</span>
                        <div className="text-[10px] font-bold text-muted-foreground leading-none">
                            <div>OUT OF 5</div>
                            <div>{totalRatings} REVIEWS</div>
                        </div>
                    </div>
                </div>
                
                <div className="text-right">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Your Vote</h3>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                disabled={isPending}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => handleRate(star)}
                                className="transition-transform active:scale-90 disabled:opacity-50"
                            >
                                <Star 
                                    className={cn(
                                        "w-6 h-6 transition-all duration-200",
                                        (hover || rating) >= star 
                                            ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]" 
                                            : "text-muted-foreground/30"
                                    )} 
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {isPending && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Recording your vote...
                </div>
            )}
        </div>
    );
}
