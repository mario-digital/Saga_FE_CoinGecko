/**
 * CoinCardSkeleton component for loading state
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CoinCardSkeletonProps {
  className?: string;
}

export const CoinCardSkeleton: React.FC<CoinCardSkeletonProps> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 p-4',
        'animate-pulse',
        className
      )}
    >
      {/* Header with coin info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div>
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>

      {/* Price and change */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Market Cap */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
};
