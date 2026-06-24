'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavLink {
    href: string;
    label: string;
}

export function DesktopNav({ navLinks }: { navLinks: NavLink[] }) {
    const pathname = usePathname();
    return (
        <nav className="hidden items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative py-2 transition-all duration-300 hover:text-primary',
                    isActive ? 'text-primary' : 'text-foreground/60'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                        layoutId="nav-glow"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_10px_rgba(225,29,72,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
        </nav>
    );
}
