
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { PwaInstallPrompt } from '@/components/layout/PwaInstallPrompt';
import { SplashProvider } from '@/components/layout/SplashProvider';

export const dynamic = 'force-dynamic';

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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23E11D48' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z'/><path d='m6.2 5.3 3.1 3.9'/><path d='m12.4 3.6 3.1 3.9'/><path d='M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'/></svg>" type="image/svg+xml" />
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
