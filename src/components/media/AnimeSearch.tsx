
'use client';

import { useState, useEffect, useTransition, useCallback, Suspense } from 'react';
import type { Show } from '@/lib/types';
import { MediaCard } from '@/components/media/MediaCard';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Film, Loader2, X } from 'lucide-react';
import { searchMedia } from '@/app/search/actions';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function SearchComponent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [results, setResults] = useState<Show[]>([]);
    const [isPending, startTransition] = useTransition();
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const createQueryString = useCallback(
        (name: string, value: string) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (value) {
            newSearchParams.set(name, value);
        } else {
            newSearchParams.delete(name);
        }
        return newSearchParams.toString();
        },
        [searchParams]
    );
  
    useEffect(() => {
        const initialQuery = searchParams.get('query') || '';
        if (initialQuery) {
            startTransition(async () => {
                const searchResults = await searchMedia(initialQuery, { genre: '' });
                const animeResults = searchResults.filter(item => item.type === 'anime') as Show[];
                setResults(animeResults);
            });
        } else {
            setResults([]);
        }
    }, []);

    useEffect(() => {
        const queryString = createQueryString('query', debouncedSearchTerm);
        router.replace(`${pathname}?${queryString}`);
        
        if (debouncedSearchTerm) {
            startTransition(async () => {
                const searchResults = await searchMedia(debouncedSearchTerm, { genre: '' });
                const animeResults = searchResults.filter(item => item.type === 'anime') as Show[];
                setResults(animeResults);
            });
        } else {
            setResults([]);
        }
    }, [debouncedSearchTerm, createQueryString, pathname, router]);


    return (
        <div className="space-y-8">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="text"
                placeholder="Search for an anime series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 text-lg h-12"
                />
                {isPending && (
                    <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
                )}
                {searchTerm && !isPending && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
            </div>

            {debouncedSearchTerm ? (
                 isPending ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <h2 className="mt-6 text-2xl font-bold">Searching for Anime...</h2>
                    </div>
                 ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {results.map((item) => (
                            <MediaCard key={item.tmdbId} media={item} showAddButton={true} />
                        ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-xl">
                        <Film className="w-16 h-16 text-muted-foreground/50" />
                        <h2 className="mt-6 text-2xl font-bold">No anime found for "{debouncedSearchTerm}"</h2>
                        <p className="mt-2 text-muted-foreground">Try a different search term.</p>
                    </div>
                 )
            ) : (
                children
            )}
        </div>
    )
}

export function AnimeSearch({ children }: { children: React.ReactNode }) {
    return (
        <Suspense>
            <SearchComponent>{children}</SearchComponent>
        </Suspense>
    )
}
