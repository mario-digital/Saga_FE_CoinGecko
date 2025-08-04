'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoinCard } from '@/components/CoinCard';
import { CoinCardSkeleton } from '@/components/CoinCardSkeleton';
import { Pagination } from '@/components/Pagination';
import { useCoins } from '@/hooks/useCoins';
import { DEFAULT_PER_PAGE } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { coins, isLoading, error, refetch } = useCoins(
    currentPage,
    DEFAULT_PER_PAGE
  );

  const handleCoinClick = (coinId: string): void => {
    router.push(`/${coinId}` as any);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate total pages (approximate - CoinGecko doesn't provide total count)
  const estimatedTotalPages = 100; // Conservative estimate

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-700 dark:text-red-300 text-sm mb-4">{error}</p>
          <button onClick={() => refetch()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: DEFAULT_PER_PAGE }).map((_, index) => (
            <CoinCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Coins Grid */}
      {coins && coins.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {coins.map(coin => (
              <CoinCard
                key={coin.id}
                coin={coin}
                onClick={handleCoinClick}
                className=""
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={estimatedTotalPages}
              onPageChange={handlePageChange}
              disabled={isLoading}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && (!coins || coins.length === 0) && (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Unable to load cryptocurrency data at this time.
            </p>
            <button onClick={() => refetch()} className="btn-primary">
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
