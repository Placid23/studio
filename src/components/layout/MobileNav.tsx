'use client';
import Link from 'next/link';
import { Clapperboard, Menu, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';


interface NavLink {
    href: string;
    label: string;
}

export function MobileNav({ user, navLinks }: { user: User | null, navLinks: NavLink[] }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] bg-background/95 p-6 flex flex-col">
                <SheetClose asChild>
                   <Link href="/" className="flex items-center gap-2 mb-8">
                      <Clapperboard className="h-8 w-8 text-primary" />
                      <span className="text-2xl font-black uppercase text-primary">NovaStream</span>
                   </Link>
                </SheetClose>
                <nav className="flex flex-col gap-4 text-lg flex-1">
                    {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                            <Link
                                href={link.href}
                                className={cn(
                                'transition-colors hover:text-primary p-2 rounded-md',
                                pathname === link.href ? 'text-primary bg-primary/10' : 'text-foreground/80'
                                )}
                            >
                                {link.label}
                            </Link>
                        </SheetClose>
                    ))}
                </nav>
                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                         <span className="text-sm text-muted-foreground">Theme</span>
                         <ThemeToggle />
                    </div>
                    {user ? (
                        <Button onClick={handleSignOut} className="w-full">
                           <LogOut className="mr-2 h-4 w-4" />
                           Logout
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                           <SheetClose asChild>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/login">Log In</Link>
                            </Button>
                           </SheetClose>
                           <SheetClose asChild>
                            <Button asChild className="w-full">
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
