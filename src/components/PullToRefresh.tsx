'use client';

import { ReactNode } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  disabled?: boolean;
}

export default function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
}: PullToRefreshProps): ReactNode {
  const { pullDistance, isRefreshing, isActive } = usePullToRefresh({
    onRefresh,
    disabled,
  });

  const opacity = Math.min(pullDistance / 80, 1);
  const rotation = (pullDistance / 80) * 360;

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none z-10',
          isActive ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${pullDistance}px)`,
        }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-md"
          style={{ opacity }}
        >
          <RefreshCw
            className={cn(
              'w-6 h-6 text-gray-600 dark:text-gray-400',
              isRefreshing && 'animate-spin'
            )}
            style={{
              transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined,
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          'transition-transform duration-200',
          isActive && 'touch-none'
        )}
        style={{
          transform: isActive
            ? `translateY(${pullDistance}px)`
            : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
