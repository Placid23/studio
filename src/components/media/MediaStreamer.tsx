
'use client';

import { useState } from "react";
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
      
      // Use the proxy for both streaming and downloading
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
      const link = document.createElement('a');
      link.href = resolvedUrl;
      const fileName = mediaName.replace(/ /g, '_') + '.mp4';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    if (error) {
       return (
        <div className="flex flex-col items-center gap-2 p-4 text-center mt-6 bg-card rounded-lg">
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
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="lg" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Resolving...
                        </>
                    ) : (
                        <>
                            <PlayCircle className="mr-2 h-6 w-6" />
                            Play / Download
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Stream</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStream('720p')} disabled={isLoading}>720p</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStream('1080p')} disabled>1080p (Unstable)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Download</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleDownload('720p')} disabled={isLoading}>720p</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('1080p')} disabled>1080p (Unstable)</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 w-full">
        {renderContent()}
      </div>
    </div>
  );
}
