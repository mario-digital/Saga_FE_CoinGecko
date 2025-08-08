import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StickyListHeaderProps {
  children: ReactNode;
  className?: string;
}

export function StickyListHeader({
  children,
  className,
}: StickyListHeaderProps): ReactNode {
  return (
    <div
      className={cn(
        'sticky top-14 sm:top-16 z-20 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm',
        'border-b border-gray-200 dark:border-gray-800',
        '-mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6',
        'py-2 sm:py-3',
        className
      )}
    >
      {children}
    </div>
  );
}
