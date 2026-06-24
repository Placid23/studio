'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast, dismiss } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the default browser mini-infobar from appearing on mobile
      event.preventDefault();
      
      // Check if already in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      
      if (isStandalone) {
        return;
      }

      // Stash the event so it can be triggered later.
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (installPromptEvent) {
      const toastId = 'pwa-install-toast';
      
      toast({
        id: toastId,
        title: 'NovaStream for Mobile',
        description: 'Install the app for a cinematic full-screen experience and background streaming.',
        duration: 30000, // Show for 30 seconds
        action: (
          <Button
            className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={async () => {
              if (!installPromptEvent) return;
              
              installPromptEvent.prompt();
              const { outcome } = await installPromptEvent.userChoice;
              
              if (outcome === 'accepted') {
                console.log('User accepted the PWA installation');
              }
              
              setInstallPromptEvent(null);
              dismiss(toastId);
            }}
          >
            <Smartphone className="mr-2 h-3 w-3" /> 
            Get App
          </Button>
        ),
      });
    }
  }, [installPromptEvent, toast, dismiss]);

  return null;
}
