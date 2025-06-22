
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PwaInstallPrompt } from '@/components/layout/PwaInstallPrompt';
import { SplashProvider } from '@/components/layout/SplashProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>NovaStream</title>
        <meta name="description" content="Your next-gen streaming experience." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" />
        <meta name="theme-color" content="#E11D48" />
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
          defaultTheme="dark"
          storageKey="novastream-theme"
        >
          <SplashProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SplashProvider>
          <Toaster />
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
