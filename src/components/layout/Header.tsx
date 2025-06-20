'use client';
import Link from 'next/link';
import { Clapperboard, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-colors duration-300",
      isScrolled ? "bg-background/90 backdrop-blur-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Clapperboard className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black uppercase text-primary">NovaStream</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className={cn(
                'transition-colors hover:text-primary',
                pathname === '/' ? 'text-primary' : 'text-foreground/80'
              )}
            >
              Home
            </Link>
            <Link
              href="/search"
              className={cn(
                'transition-colors hover:text-primary',
                pathname === '/search' ? 'text-primary' : 'text-foreground/80'
              )}
            >
              Search
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search" passHref>
             <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
