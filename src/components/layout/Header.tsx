import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { UserNav } from './UserNav';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
import type { User } from '@supabase/supabase-js';

export async function Header() {
  let user: User | null = null;
  
  // Only attempt to get the user if Supabase is configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (e) {
        // This can happen if the Supabase URL is not a valid URL.
        // We'll just ignore it and the user will be treated as logged out.
    }
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/shows', label: 'TV Shows' },
    { href: '/library', label: 'My Library' },
    { href: '/search', label: 'Search' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Clapperboard className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black uppercase text-primary">NovaStream</span>
          </Link>
          <DesktopNav navLinks={navLinks} />
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex">
                <UserNav user={user} />
            </div>
            <div className="md:hidden">
                <MobileNav user={user} navLinks={navLinks} />
            </div>
        </div>
      </div>
    </header>
  );
}
