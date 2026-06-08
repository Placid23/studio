
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { VideoModal } from "./VideoModal";

interface MediaStreamerProps {
  mediaName: string;
}

export function MediaStreamer({ mediaName }: MediaStreamerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <Button 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
        >
          <PlayCircle className="mr-2 h-6 w-6" />
          Watch / Download
        </Button>
      </div>

      <VideoModal
        title={mediaName}
        type="movie"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
