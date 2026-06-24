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
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

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

    const handleSearch = useCallback(async (query: string) => {
        if (!query) {
            setResults([]);
            return;
        }
        
        startTransition(async () => {
            try {
                const searchResults = await searchMedia(query, { genre: '' });
                // Robust filtering: check genre and original language
                const animeResults = searchResults.filter(item => {
                    const isMappedAnime = item.type === 'anime';
                    const hasAnimeGenre = item.genres?.some(g => g.toLowerCase().includes('animation'));
                    return isMappedAnime || hasAnimeGenre;
                }) as Show[];
                setResults(animeResults);
            } catch (error) {
                console.error("Search failed:", error);
                setResults([]);
            }
        });
    }, []);
  
    useEffect(() => {
        const initialQuery = searchParams.get('query') || '';
        if (initialQuery) {
            handleSearch(initialQuery);
        }
    }, [handleSearch]);

    useEffect(() => {
        const queryString = createQueryString('query', debouncedSearchTerm);
        // Only push to router if query actually changed to avoid unnecessary refreshes
        if (searchParams.get('query') !== debouncedSearchTerm) {
            router.replace(`${pathname}?${queryString}`, { scroll: false });
        }
        handleSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm, createQueryString, pathname, router, handleSearch, searchParams]);


    return (
        <div className="space-y-8">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    type="text"
                    placeholder="Search for an anime series..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 h-14 text-xl rounded-2xl bg-card/50 border-white/5 focus-visible:ring-primary shadow-2xl relative z-10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                    {isPending && (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    )}
                    {searchTerm && !isPending && (
                        <button 
                            onClick={() => setSearchTerm('')} 
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {debouncedSearchTerm ? (
                 isPending ? (
                    <div className="flex flex-col items-center justify-center text-center py-32 bg-card/20 backdrop-blur-sm rounded-[3rem] border border-white/5 border-dashed">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
                            <Loader2 className="w-16 h-16 text-primary animate-spin relative" />
                        </div>
                        <h2 className="mt-8 text-2xl font-black uppercase tracking-tighter">Scanning Multiverse...</h2>
                        <p className="text-muted-foreground font-medium mt-2">Locating anime metadata</p>
                    </div>
                 ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {results.map((item) => (
                            <MediaCard key={item.tmdbId} media={item} showAddButton={true} />
                        ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center text-center py-32 bg-card/20 rounded-[3rem] border border-white/5">
                        <Film className="w-16 h-16 text-muted-foreground/30 mb-6" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter">No Anime Found</h2>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">We couldn't find any series matching "{debouncedSearchTerm}" in our databases.</p>
                    </div>
                 )
            ) : (
                <div className="animate-in fade-in duration-1000">
                    {children}
                </div>
            )}
        </div>
    )
}

export function AnimeSearch({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="h-20 w-full bg-card/50 rounded-2xl animate-pulse" />}>
            <SearchComponent>{children}</SearchComponent>
        </Suspense>
    )
}
