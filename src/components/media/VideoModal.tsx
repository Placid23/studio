'use client';

import { useState, useEffect, useCallback } from "react";
import {
  fetchOptions,
  fetchEpisodes,
  resolveDownload,
  getStreamUrl,
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

type Step = "idle" | "loading" | "options" | "resolving" | "playing" | "error";

interface VideoModalProps {
  title: string;
  type: "movie" | "series";
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ title, type, isOpen, onClose }: VideoModalProps) {
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

  const handleStart = useCallback(async () => {
    setStep("loading");
    setError("");
    setIsUsingFallback(false);
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
      console.error("[VideoModal] Initialization error:", e);
      setError(e.message || "Failed to connect to stream server.");
      setStep("error");
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
    }
  }, [isOpen, handleStart]);

  async function handleSeasonChange(s: string) {
    setSeason(s);
    setEpisode("");
    setStep("loading");
    try {
      const data = await fetchEpisodes(title, s);
      setEpisodes(data.episodes);
      setStep("options");
    } catch (e: any) {
      setError(e.message);
      setStep("error");
    }
  }

  async function handleQualityPick(q: Quality) {
    setStep("resolving");
    setError("");
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
      
      // Determine referer from headers if provided by the backend
      const referer = data.headers?.Referer || data.headers?.referer;
      setStreamUrl(getStreamUrl(data.url, referer));
      
      setStep("playing");
    } catch (e: any) {
      setError(e.message);
      setStep("error");
    }
  }

  const handleStreamError = () => {
    if (!isUsingFallback && dlUrl) {
      console.warn("[VideoModal] Initial stream failed, attempting Playwright fallback...");
      setIsUsingFallback(true);
      setStreamUrl(getPlaywrightStreamUrl(dlUrl));
    } else {
      // If even fallback fails, offer the direct link as a last resort
      window.open(dlUrl, "_blank");
    }
  };

  const showQualities = type === "movie" || (type === "series" && episode !== "");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-white/10 text-white p-0 overflow-hidden rounded-[2rem] shadow-2xl">
        <div className="p-8">
          <DialogHeader className="mb-6 relative">
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-primary flex items-center gap-2 pr-8">
              <PlayCircle className="w-8 h-8 shrink-0" />
              <span className="truncate">{title}</span>
            </DialogTitle>
          </DialogHeader>

          {(step === "loading" || step === "resolving") && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
              </div>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                {step === "loading" ? "Initializing Stream Engine..." : "Resolving High-Speed Mirror..."}
              </p>
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
              <div className="relative group overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-black aspect-video">
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
                <Button asChild variant="outline" className="h-14 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase tracking-widest text-xs">
                  <a href={dlUrl} download>
                    <Download className="mr-2 w-5 h-5" />
                    Download File
                  </a>
                </Button>
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
