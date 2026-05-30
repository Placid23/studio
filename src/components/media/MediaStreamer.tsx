
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlayCircle, Download, Loader2, AlertCircle, Monitor, Smartphone, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaStreamerProps {
  mediaName: string;
}

export function MediaStreamer({ mediaName }: MediaStreamerProps) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resolveAndSetUrl = async (quality: '720p' | '1080p') => {
    setIsLoading(true);
    setError(null);
    setStreamUrl(null);
    
    try {
      const res = await fetch(`/api/fzmovies?q=${encodeURIComponent(mediaName)}&quality=${quality}`);
      const data = await res.json();

      if (data.error || !data.finalUrl) {
        throw new Error(data.error || "Failed to resolve download link.");
      }
      
      return `/api/proxy-download?url=${encodeURIComponent(data.finalUrl)}`;

    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Link Resolution Failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
        setIsLoading(false);
    }
  };

  const handleStream = async (quality: '720p' | '1080p') => {
    const resolvedUrl = await resolveAndSetUrl(quality);
    if (resolvedUrl) {
      setStreamUrl(resolvedUrl);
    }
  };

  const handleDownload = async (quality: '720p' | '1080p') => {
    const resolvedUrl = await resolveAndSetUrl(quality);
    if (resolvedUrl) {
      const link = document.createElement('a');
      link.href = `${resolvedUrl}&download=true`;
      const fileName = mediaName.replace(/ /g, '_') + `_${quality}.mp4`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    if (error) {
       return (
        <div className="flex flex-col items-center gap-2 p-6 text-center mt-6 bg-destructive/5 border border-destructive/20 rounded-2xl">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-bold text-destructive uppercase tracking-widest">Mirror Link Error</p>
            <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
        </div>
      );
    }
    if (streamUrl) {
      return (
        <div className="relative group mt-8">
            <div className="absolute inset-0 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-all" />
            <video
              src={streamUrl}
              controls
              autoPlay
              className="relative w-full max-w-4xl rounded-3xl shadow-2xl border border-white/10 aspect-video bg-black z-10"
            />
            <Button 
                onClick={() => setStreamUrl(null)} 
                variant="outline" 
                size="sm" 
                className="mt-4 w-full rounded-xl border-white/5 hover:bg-white/5 text-muted-foreground uppercase text-[10px] font-black tracking-widest"
            >
                Close Stream
            </Button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="lg" disabled={isLoading} className="rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Analyzing Mirrors...
                        </>
                    ) : (
                        <>
                            <PlayCircle className="mr-2 h-6 w-6" />
                            Play / Download
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-2xl p-2 bg-card/90 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Stream Quality</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStream('720p')} className="rounded-xl h-12 flex items-center gap-3 cursor-pointer">
                    <Smartphone className="w-4 h-4 opacity-70" />
                    <div className="flex flex-col">
                        <span className="font-bold">Standard (720p)</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black">Best for mobile</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStream('1080p')} className="rounded-xl h-12 flex items-center gap-3 cursor-pointer">
                    <Monitor className="w-4 h-4 opacity-70" />
                    <div className="flex flex-col">
                        <span className="font-bold">High (1080p)</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black">Best for desktop</span>
                    </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-white/5 my-2" />
                
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Save Offline</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleDownload('720p')} className="rounded-xl h-12 flex items-center gap-3 cursor-pointer">
                    <Zap className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                        <span className="font-bold">Fast Download</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black">Smaller file size</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('1080p')} className="rounded-xl h-12 flex items-center gap-3 cursor-pointer">
                    <Download className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                        <span className="font-bold">Full HD Download</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black">Original quality</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}
