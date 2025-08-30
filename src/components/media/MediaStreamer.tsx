
'use client';

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlayCircle, Download, Loader2, AlertCircle } from "lucide-react";
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
        title: "Error",
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
      // Trigger download by navigating to the proxy URL
      window.location.href = resolvedUrl;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold">Resolving Link...</p>
            <p className="text-xs text-muted-foreground">Please wait, this may take a moment.</p>
        </div>
      );
    }
    if (error) {
       return (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold text-destructive">Could Not Get Link</p>
            <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
        </div>
      );
    }
    if (streamUrl) {
      return (
        <video
          src={streamUrl}
          controls
          autoPlay
          className="w-full max-w-4xl rounded-lg shadow-2xl aspect-video bg-black"
        />
      );
    }
    return null; // Initial state, nothing to show
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="lg" disabled={isLoading}>
                    <PlayCircle className="mr-2 h-6 w-6" />
                    {isLoading ? 'Loading...' : 'Play / Download'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Stream</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStream('720p')}>720p</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStream('1080p')} disabled>1080p (Coming Soon)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Download</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleDownload('720p')}>720p</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('1080p')} disabled>1080p (Coming Soon)</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 w-full">
        {renderContent()}
      </div>
    </div>
  );
}
