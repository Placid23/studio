import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PwaInstallPrompt } from '@/components/layout/PwaInstallPrompt';
import { SplashProvider } from '@/components/layout/SplashProvider';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>NovaStream | Premium Media</title>
        <meta name="description" content="Stream your personal library of movies, TV shows, and music with NovaStream." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E11D48" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NovaStream" />
        <link rel="apple-touch-icon" href="https://placehold.co/192x192/E11D48/ffffff?text=NS" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
          defaultTheme="dark"
          storageKey="novastream-theme"
        >
          <SplashProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pb-24">{children}</main>
                <Footer />
              </div>
          </SplashProvider>
          <Toaster />
          <PwaInstallPrompt />
        </ThemeProvider>

        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
