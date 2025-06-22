'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLink {
    href: string;
    label: string;
}

export function DesktopNav({ navLinks }: { navLinks: NavLink[] }) {
    const pathname = usePathname();
    return (
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            ))}
        </nav>
    );
}
