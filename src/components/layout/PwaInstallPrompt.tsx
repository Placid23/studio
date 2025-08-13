
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Define the event type, as it's not standard in all TS lib versions.
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
      event.preventDefault();
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone || (window.navigator as any).standalone) {
        return;
      }
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
        title: 'Install NovaStream App',
        description: 'Get a full-screen experience with background audio.',
        duration: Infinity, // Keep the toast visible until dismissed or action is taken
        action: (
          <Button
            onClick={async () => {
              if (!installPromptEvent) return;
              
              installPromptEvent.prompt();
              const { outcome } = await installPromptEvent.userChoice;
              if (outcome === 'accepted') {
                console.log('User accepted the PWA installation');
              } else {
                console.log('User dismissed the PWA installation');
              }
              setInstallPromptEvent(null);
              dismiss(toastId);
            }}
          >
            <Download className="mr-2" /> Install
          </Button>
        ),
      });
    }
  }, [installPromptEvent, toast, dismiss]);

  return null; // This component doesn't render anything itself
}
