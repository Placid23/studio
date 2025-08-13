
'use client';

import { useState, useEffect } from 'react';
import type { Track } from '@/lib/types';
import { suggestSimilarSongs, SuggestSimilarSongsOutput } from '@/ai/flows/suggest-similar-songs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Music2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export function SimilarSongs({ track }: { track: Track }) {
  const [suggestions, setSuggestions] = useState<SuggestSimilarSongsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await suggestSimilarSongs({
        title: track.title,
        artist: track.artist.name,
        genre: '', // Genre isn't readily available, but the AI can infer
      });
      setSuggestions(result);
    } catch (e) {
      console.error('Failed to get song suggestions:', e);
      setError('Could not load suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [track]);

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold uppercase tracking-wider">You Might Also Like</h2>
            <Button variant="ghost" size="icon" onClick={fetchSuggestions} disabled={isLoading}>
                <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            </Button>
        </div>
      
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : error ? (
            <p className="text-destructive">{error}</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions?.suggestions.map((song, index) => (
                <Card key={index} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            <Music2 className="w-8 h-8 text-primary mt-1" />
                            <div>
                                <CardTitle>{song.title}</CardTitle>
                                <CardDescription>{song.artist} - <span className="italic">{song.album}</span></CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">{song.reason}</p>
                    </CardContent>
                </Card>
            ))}
            </div>
        )}
    </div>
  );
}
