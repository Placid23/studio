import Link from 'next/link';
import { Clapperboard, Search } from 'lucide-react';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { UserNav } from './UserNav';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
import { Button } from '@/components/ui/button';

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

  // General navigation links (Search removed from here to be more prominent elsewhere)
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/shows', label: 'TV Shows' },
    { href: '/anime', label: 'Anime' },
    { href: '/music', label: 'Music' },
    { href: '/library', label: 'My Library' },
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
            {/* Highly Noticeable Search Button */}
            <Button 
              asChild 
              variant="ghost" 
              size="icon" 
              className="relative h-10 w-10 md:w-auto md:px-4 rounded-xl border border-white/5 bg-white/5 hover:bg-primary hover:text-white transition-all duration-300 group shadow-lg"
            >
              <Link href="/search">
                <Search className="h-5 w-5 md:mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Search</span>
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.8)] md:hidden"></div>
              </Link>
            </Button>

            <UserNav user={user} />
            
            <div className="md:hidden">
                <MobileNav user={user} navLinks={[...navLinks, { href: '/search', label: 'Search' }]} />
            </div>
        </div>
      </div>
    </header>
  );
}
