'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Search, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Route } from 'next';

interface NavItem {
  href: Route<string> | '#';
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

interface BottomNavProps {
  onSearchOpen: () => void;
  onMenuOpen: () => void;
}

export function BottomNav({
  onSearchOpen,
  onMenuOpen,
}: BottomNavProps): ReactNode {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/' as Route<string>,
      icon: <Home className="w-5 h-5" />,
      label: 'Home',
    },
    {
      href: '/?filter=top10' as Route<string>,
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Top 10',
    },
    {
      href: '#',
      icon: <Search className="w-5 h-5" />,
      label: 'Search',
      onClick: onSearchOpen,
    },
    {
      href: '#',
      icon: <MoreHorizontal className="w-5 h-5" />,
      label: 'More',
      onClick: onMenuOpen,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 sm:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map(item => {
          const isActive = pathname === item.href;

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  isActive
                    ? 'text-primary dark:text-primary'
                    : 'text-gray-600 dark:text-gray-400'
                )}
                aria-label={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                isActive
                  ? 'text-primary dark:text-primary'
                  : 'text-gray-600 dark:text-gray-400'
              )}
              aria-label={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-bottom bg-white dark:bg-gray-900" />
    </nav>
  );
}
