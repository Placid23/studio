'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchOptions,
  fetchEpisodes,
  resolveDownload,
  getStreamUrl,
  getDownloadUrl,
  getPlaywrightStreamUrl,
  type Quality,
} from "@/lib/flask-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, Download, AlertTriangle, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type Step = "idle" | "loading" | "options" | "resolving" | "playing" | "error";

interface VideoModalProps {
  title: string;
  type: "movie" | "series";
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
}

export function VideoModal({ title, type, isOpen, onClose, isLoggedIn = false }: VideoModalProps) {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [seasons, setSeasons] = useState<string[]>([]);
  const [episodes, setEpisodes] = useState<string[]>([]);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [dlUrl, setDlUrl] = useState("");
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  
  // Progress Simulation
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const buildFilename = useCallback(() => {
    const safe = title.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
    if (type === "series" && season && episode) {
      const sNum = season.match(/\d+/)?.[0]?.padStart(2, "0") ?? "01";
      const eNum = episode.replace(/\D/g, '').padStart(2, "0") || "01";
      return `${safe}_S${sNum}E${eNum}.mp4`;
    }
    return `${safe}.mp4`;
  }, [title, type, season, episode]);

  const startProgress = () => {
    setProgress(10);
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 400);
  };

  const stopProgress = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  const handleStart = useCallback(async () => {
    setStep("loading");
    setError("");
    setIsUsingFallback(false);
    startProgress();
    
    try {
      const data = await fetchOptions(title, type);
      if (data.error) throw new Error(data.error);

      if (data.type === "series") {
        setSeasons(data.seasons ?? []);
        setEpisodes(data.episodes ?? []);
        setSeason(data.seasons?.[0] ?? "");
      } else {
        setQualities(data.qualities ?? []);
      }
      setStep("options");
    } catch (e: any) {
      setError(e.message || "Failed to connect to stream server.");
      setStep("error");
    } finally {
      stopProgress();
    }
  }, [title, type]);

  useEffect(() => {
    if (isOpen) {
      handleStart();
    } else {
      setStep("idle");
      setEpisode("");
      setSeason("");
      setError("");
      setIsUsingFallback(false);
      setProgress(0);
    }
    return () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isOpen, handleStart]);

  async function handleSeasonChange(s: string) {
    setSeason(s);
    setEpisode("");
    setStep("loading");
    startProgress();
    try {
      const data = await fetchEpisodes(title, s);
      setEpisodes(data.episodes);
      setStep("options");
    } catch (e: any) {
      setError(e.message);
      setStep("error");
    } finally {
      stopProgress();
    }
  }

  async function handleQualityPick(q: Quality) {
    setStep("resolving");
    setError("");
    startProgress();
    try {
      const data = await resolveDownload({
        title,
        type,
        quality: q.resolution,
        season: season || undefined,
        episode: episode || undefined,
      });
      if (data.error) throw new Error(data.error);
      setDlUrl(data.url);
      
      const referer = data.headers?.Referer || data.headers?.referer;
      setStreamUrl(getStreamUrl(data.url, referer));
      
      setStep("playing");
    } catch (e: any) {
      setError(e.message);
      setStep("error");
    } finally {
      stopProgress();
    }
  }

  const handleStreamError = () => {
    if (!isUsingFallback && dlUrl) {
      setIsUsingFallback(true);
      setStreamUrl(getPlaywrightStreamUrl(dlUrl));
    } else {
      window.open(dlUrl, "_blank");
    }
  };

  const showQualities = type === "movie" || (type === "series" && episode !== "");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="p-8">
          <DialogHeader className="mb-6 relative">
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-primary flex items-center gap-2 pr-8">
              <PlayCircle className="w-8 h-8 shrink-0" />
              <span className="truncate">{title}</span>
            </DialogTitle>
          </DialogHeader>

          {(step === "loading" || step === "resolving") && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
              </div>
              <div className="w-full max-w-xs space-y-2">
                <Progress value={progress} className="h-1 bg-white/5" />
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span>{step === "loading" ? "Initializing Engine" : "Resolving Mirror"}</span>
                    <span>{progress}%</span>
                </div>
              </div>
            </div>
          )}

          {step === "options" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {type === "series" && seasons.length > 0 && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 block ml-1">Select Season</label>
                  <div className="flex flex-wrap gap-2">
                    {seasons.map((s) => (
                      <Button
                        key={s}
                        variant={season === s ? "default" : "outline"}
                        onClick={() => handleSeasonChange(s)}
                        className={cn(
                          "rounded-xl h-10 px-5 font-bold transition-all",
                          season === s ? "shadow-lg shadow-primary/20" : "border-white/5 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {type === "series" && episodes.length > 0 && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 block ml-1">Select Episode</label>
                  <ScrollArea className="h-48 rounded-2xl border border-white/5 bg-white/5 p-4">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {episodes.map((ep) => (
                        <button
                          key={ep}
                          onClick={() => setEpisode(ep)}
                          className={cn(
                            "flex h-12 w-full items-center justify-center rounded-xl border text-sm font-black transition-all",
                            episode === ep
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                              : "border-white/5 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:text-white"
                          )}
                        >
                          {ep.replace(/\D/g, '') || ep}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {showQualities && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 block ml-1">Select Stream Quality</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {qualities.length > 0 ? (
                      qualities.map((q) => (
                        <button
                          key={q.resolution}
                          onClick={() => handleQualityPick(q)}
                          className="group relative flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                        >
                          <div>
                            <div className="font-black text-lg group-hover:text-primary transition-colors">{q.resolution}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex gap-2">
                              <span>{q.format}</span>
                              <span>•</span>
                              <span>{q.size}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center text-zinc-500 border-2 border-dashed border-white/5 rounded-2xl">
                        No quality options returned.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "playing" && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-black aspect-video">
                 <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <video
                  src={streamUrl}
                  controls
                  autoPlay
                  className="relative z-10 w-full h-full"
                  onError={handleStreamError}
                />
                {isUsingFallback && (
                  <div className="absolute top-4 left-4 z-20 bg-primary/80 text-white text-[9px] font-bold uppercase px-2 py-1 rounded-md backdrop-blur-md animate-pulse">
                    Session Link Active
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                {isLoggedIn ? (
                    <Button asChild variant="outline" className="h-14 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase tracking-widest text-xs">
                        <a href={getDownloadUrl(dlUrl, buildFilename())}>
                            <Download className="mr-2 w-5 h-5" />
                            Download {buildFilename()}
                        </a>
                    </Button>
                ) : (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Download Restricted</p>
                        <p className="text-xs text-zinc-400 mt-1">Please sign in to unlock high-speed downloads.</p>
                    </div>
                )}
                
                <Button onClick={() => setStep("options")} variant="ghost" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em]">
                  Switch Quality / Episode
                </Button>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in shake-1">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Playback Interrupted</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">{error}</p>
              </div>
              <Button onClick={handleStart} className="rounded-xl px-8 h-12 shadow-xl shadow-primary/20">
                Re-Initialize Engine
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
