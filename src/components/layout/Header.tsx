import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { UserNav } from './UserNav';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';

export async function Header() {
  let user = null;
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-token')?.value;

  if (token) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0],
        photoURL: decodedToken.picture || null,
      };
    } catch (error) {
      console.error('Firebase token verification failed:', error);
    }
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/shows', label: 'TV Shows' },
    { href: '/anime', label: 'Anime' },
    { href: '/music', label: 'Music' },
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