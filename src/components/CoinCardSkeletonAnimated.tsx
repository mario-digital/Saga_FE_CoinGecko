/**
 * Animated skeleton loader for coin cards with shimmer effect
 */

import React from 'react';

import { cn } from '@/lib/utils';

interface CoinCardSkeletonAnimatedProps {
  className?: string;
}

export const CoinCardSkeletonAnimated: React.FC<
  CoinCardSkeletonAnimatedProps
> = ({ className }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700',
        'p-3 sm:p-4 min-h-[120px] sm:min-h-[140px]',
        'animate-pulse',
        className
      )}
    >
      {/* Header with coin info skeleton */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 animate-shimmer" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-3/4" />
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/4" />
          </div>
        </div>
        <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer" />
      </div>

      {/* Price and change skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/3" />
          <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/4" />
        </div>

        {/* Market Cap skeleton */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/4" />
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/3" />
        </div>

        {/* Volume skeleton */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/4" />
          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/3" />
        </div>
      </div>
    </div>
  );
};
