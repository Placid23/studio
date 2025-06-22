
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@/components/layout/SplashScreen';

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  // Set a timer to hide the splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Duration of the splash screen
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen />}
      </AnimatePresence>
      {children}
    </>
  );
}
