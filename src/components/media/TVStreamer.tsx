
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, PlayCircle, Download, MonitorPlay } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface SearchResult {
  title: string;
  url: string;
}
interface Season {
  season: string;
  url: string;
}
interface Episode {
  episode: string;
  url: string;
}
interface DownloadLink {
  quality: string;
  streamUrl: string;
  downloadUrl: string;
}

export function TVStreamer({ showName }: { showName: string }) {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [isLoading, setIsLoading] = useState<'search' | 'seasons' | 'episodes' | 'links' | false>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSeasonUrl, setActiveSeasonUrl] = useState<string | null>(null);
  const [activeEpisodeUrl, setActiveEpisodeUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const doSearch = async () => {
      setIsLoading('search');
      setError(null);
      try {
        const res = await fetch('/api/fztv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'search', query: showName }),
        });
        const data = await res.json();
        if (data.error || data.length === 0) throw new Error(data.error || 'Mirror not found.');
        
        const bestMatch = data.find((r: SearchResult) =>
          r.title.toLowerCase().includes(showName.toLowerCase())
        ) || data[0];

        setSearchResult(bestMatch);
        await fetchSeasons(bestMatch.url);
      } catch (err: any) {
        setError(err.message);
        toast({ title: 'Mirror Error', description: err.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    if (showName) doSearch();
  }, [showName, toast]);

  const fetchSeasons = async (url: string) => {
    setIsLoading('seasons');
    try {
      const res = await fetch('/api/fztv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seasons', url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSeasons(data);
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Seasons Unavailable', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEpisodes = async (url: string) => {
    if (activeSeasonUrl === url) return;
    setActiveSeasonUrl(url);
    setEpisodes([]);
    setDownloadLinks([]);
    setIsLoading('episodes');
    try {
      const res = await fetch('/api/fztv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'episodes', url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEpisodes(data);
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Episodes Offline', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDownloadLinks = async (url: string) => {
    setActiveEpisodeUrl(url);
    setDownloadLinks([]);
    setIsLoading('links');
    try {
      const res = await fetch('/api/fztv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download', url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDownloadLinks(data); 
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Download Link Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading === 'search' || (isLoading === 'seasons' && seasons.length === 0)) {
    return (
      <div className="flex items-center gap-4 text-muted-foreground p-8 bg-card/30 rounded-3xl border border-white/5">
        <div className="p-3 bg-primary/10 rounded-2xl">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col">
            <span className="font-black uppercase tracking-widest text-[10px] opacity-60">Scraping Mirrors</span>
            <span className="font-bold">Locating "{showName}"...</span>
        </div>
      </div>
    );
  }

  if (error && !seasons.length) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center bg-destructive/5 border border-destructive/20 rounded-3xl">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-black uppercase tracking-[0.2em] text-destructive">Show Not Found</p>
        <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full bg-card/30 backdrop-blur-xl rounded-3xl p-4 border border-white/5 shadow-2xl">
        {seasons.map((season) => (
          <AccordionItem value={season.url} key={season.url} className="border-white/5 last:border-0">
            <AccordionTrigger 
                onClick={() => fetchEpisodes(season.url)}
                className="hover:no-underline hover:bg-white/5 px-4 rounded-xl py-6 transition-all"
            >
              <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MonitorPlay className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg font-black uppercase tracking-tight">{season.season}</span>
                  {isLoading === 'episodes' && activeSeasonUrl === season.url && (
                    <Loader2 className="animate-spin h-4 w-4 ml-2 opacity-50" />
                  )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="pl-4 space-y-3">
                {episodes.map(ep => (
                  <div key={ep.url} className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-tighter text-sm opacity-80 group-hover:opacity-100">{ep.episode}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => fetchDownloadLinks(ep.url)}
                        disabled={isLoading === 'links' && activeEpisodeUrl === ep.url}
                        className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] bg-background/50 hover:bg-primary hover:text-white transition-all"
                      >
                        {isLoading === 'links' && activeEpisodeUrl === ep.url
                          ? <Loader2 className="animate-spin h-4 w-4" />
                          : 'Get Links'}
                      </Button>
                    </div>
                    {activeEpisodeUrl === ep.url && downloadLinks.length > 0 && (
                      <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
                        {downloadLinks.map(link => (
                          <div key={link.streamUrl} className="flex flex-wrap gap-3 items-center">
                            <div className="flex-1 flex flex-col">
                                <Badge variant="secondary" className="w-fit rounded-lg px-2 py-0 text-[9px] font-black uppercase tracking-widest border-primary/20">{link.quality}</Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => setVideoUrl(link.streamUrl)} className="rounded-xl h-10 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all">
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Stream
                                </Button>
                                <Button size="sm" variant="outline" asChild className="rounded-xl h-10 px-4 border-white/5 hover:bg-white/5">
                                <Link href={link.downloadUrl} target="_blank" download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Save
                                </Link>
                                </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {videoUrl && (
        <div className="mt-8 relative group">
          <div className="absolute inset-0 bg-primary/10 blur-[100px] animate-pulse" />
          <video src={videoUrl} controls autoPlay className="relative w-full aspect-video rounded-3xl bg-black shadow-2xl border border-white/10 z-10"></video>
          <Button onClick={() => setVideoUrl(null)} variant="outline" className="mt-4 w-full rounded-2xl h-14 border-white/5 hover:bg-white/5 text-muted-foreground uppercase font-black tracking-[0.2em] text-xs">
            Close Media Player
          </Button>
        </div>
      )}
    </div>
  );
}
