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
    <header className="sticky top-4 z-50 w-full px-4 pointer-events-none">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 rounded-2xl border border-white/10 bg-background/60 backdrop-blur-2xl shadow-2xl shadow-black/50 supports-[backdrop-filter]:bg-background/40 pointer-events-auto">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                <Clapperboard className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter text-primary hidden sm:block">NovaStream</span>
          </Link>
          <DesktopNav navLinks={navLinks} />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
            <UserNav user={user} />
            <div className="md:hidden">
                <MobileNav user={user} navLinks={navLinks} />
            </div>
        </div>
      </div>
    </header>
  );
}
