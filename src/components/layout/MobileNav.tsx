'use client';
import Link from 'next/link';
import { Clapperboard, Menu, LogOut, Home, Film, Tv, Music, Library, Search, User, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const iconMap: Record<string, any> = {
    'Home': Home,
    'Movies': Film,
    'TV Shows': Tv,
    'Anime': Clapperboard,
    'Music': Music,
    'My Library': Library,
    'Search': Search,
};

export function MobileNav({ user, navLinks }: { user: any, navLinks: { href: string, label: string }[] }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            document.cookie = 'firebase-token=; path=/; max-age=0; SameSite=Lax';
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-background/95 backdrop-blur-xl p-0 flex flex-col border-r border-primary/10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                
                <div className="p-6 border-b border-border/40">
                    <SheetClose asChild>
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
                                <Clapperboard className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter text-primary">NovaStream</span>
                        </Link>
                    </SheetClose>
                </div>

                <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = iconMap[link.label] || Settings;
                        const isActive = pathname === link.href;
                        
                        return (
                            <SheetClose asChild key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium group',
                                        isActive 
                                            ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                            : 'text-foreground/70 hover:bg-primary/10 hover:text-primary'
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-primary")} />
                                    {link.label}
                                </Link>
                            </SheetClose>
                        );
                    })}
                </nav>

                <div className="mt-auto p-4 bg-muted/30 border-t border-border/40">
                    <div className="flex items-center justify-between mb-6 px-2">
                         <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Preferences</span>
                         </div>
                         <ThemeToggle />
                    </div>
                    
                    {user ? (
                        <Button 
                            variant="destructive" 
                            onClick={handleSignOut} 
                            className="w-full justify-start gap-3 rounded-xl h-12 shadow-sm"
                        >
                           <LogOut className="h-4 w-4" />
                           Logout
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                           <SheetClose asChild>
                                <Button asChild variant="outline" className="w-full rounded-xl h-12 border-primary/20">
                                    <Link href="/login">Log In</Link>
                                </Button>
                           </SheetClose>
                           <SheetClose asChild>
                                <Button asChild className="w-full rounded-xl h-12 shadow-lg shadow-primary/20">
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                           </SheetClose>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
