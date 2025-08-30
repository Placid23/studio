
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, PlayCircle, Download } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
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
  url: string;
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
        if (data.error || data.length === 0) throw new Error(data.error || 'TV show not found.');
        
        // Find the best match
        const bestMatch = data.find((r: SearchResult) => r.title.toLowerCase().includes(showName.toLowerCase())) || data[0];
        setSearchResult(bestMatch);
        
        // Automatically fetch seasons for the best match
        await fetchSeasons(bestMatch.url);

      } catch (err: any) {
        setError(err.message);
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    if (showName) {
      doSearch();
    }
  }, [showName, toast]);

  const fetchSeasons = async (url: string) => {
    setIsLoading('seasons');
    setError(null);
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
      toast({ title: 'Error', description: `Could not fetch seasons: ${err.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEpisodes = async (url: string) => {
    if (activeSeasonUrl === url) { // Already open, do nothing
      return;
    }
    setActiveSeasonUrl(url);
    setActiveEpisodeUrl(null);
    setEpisodes([]);
    setDownloadLinks([]);
    setIsLoading('episodes');
    setError(null);
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
      toast({ title: 'Error', description: `Could not fetch episodes: ${err.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDownloadLinks = async (url: string) => {
      setActiveEpisodeUrl(url);
      setDownloadLinks([]);
      setIsLoading('links');
      setError(null);
      try {
        const res = await fetch('/api/fztv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'download', url }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Instead of resolving the final link here, we will use the proxy
        const proxiedLinks = data.map((link: DownloadLink) => ({
            ...link,
            url: `/api/proxy-download?url=${encodeURIComponent(link.url)}`
        }))
        setDownloadLinks(proxiedLinks);
      } catch (err: any) {
        setError(err.message);
        toast({ title: 'Error', description: `Could not get download links: ${err.message}`, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
  }

  if (isLoading === 'search' || (isLoading === 'seasons' && seasons.length === 0)) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-4 bg-card rounded-lg">
        <Loader2 className="animate-spin h-5 w-5" />
        Searching for "{showName}"...
      </div>
    );
  }

  if (error && !seasons.length) {
      return (
        <div className="flex flex-col items-center gap-2 p-4 text-center bg-card rounded-lg">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold text-destructive">Could Not Find Show</p>
            <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
        </div>
      )
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full bg-card rounded-lg p-2">
        {seasons.map((season) => (
          <AccordionItem value={season.url} key={season.url}>
            <AccordionTrigger onClick={() => fetchEpisodes(season.url)}>
                {season.season}
                {isLoading === 'episodes' && activeSeasonUrl === season.url && <Loader2 className="animate-spin h-4 w-4 ml-2" />}
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                {episodes.map(ep => (
                  <div key={ep.url} className="flex flex-col p-2 rounded-md hover:bg-card-foreground/5">
                      <div className="flex items-center justify-between">
                          <span>{ep.episode}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => fetchDownloadLinks(ep.url)}
                            disabled={isLoading === 'links' && activeEpisodeUrl === ep.url}
                          >
                            {isLoading === 'links' && activeEpisodeUrl === ep.url ? <Loader2 className="animate-spin h-4 w-4" /> : 'Get Links'}
                          </Button>
                      </div>
                      {activeEpisodeUrl === ep.url && downloadLinks.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                              {downloadLinks.map(link => (
                                  <div key={link.url} className="flex gap-2">
                                       <Button size="sm" onClick={() => setVideoUrl(link.url)}>
                                            <PlayCircle className="mr-2" />
                                            Stream {link.quality}
                                       </Button>
                                       <Button size="sm" variant="outline" asChild>
                                           <Link href={link.url} target="_blank">
                                                <Download className="mr-2" />
                                                Download {link.quality}
                                           </Link>
                                       </Button>
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
          <div className="mt-6">
              <video src={videoUrl} controls autoPlay className="w-full aspect-video rounded-lg bg-black"></video>
               <Button onClick={() => setVideoUrl(null)} variant="outline" className="mt-2 w-full">Close Player</Button>
          </div>
      )}
    </div>
  );
}
