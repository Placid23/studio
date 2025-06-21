'use client';

import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PwaInstallPrompt } from '@/components/layout/PwaInstallPrompt';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  // Set a timer to hide the splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Duration of the splash screen
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>NovaStream</title>
        <meta name="description" content="Your next-gen streaming experience." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#E11D48" />
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
          defaultTheme="dark"
          storageKey="novastream-theme"
        >
          <AnimatePresence>
            {isLoading && <SplashScreen />}
          </AnimatePresence>
          
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
