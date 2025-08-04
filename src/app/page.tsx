'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoinCard } from '@/components/CoinCard';
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
    router.push(`/${coinId}` satisfies `/${string}`);
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button onClick={() => refetch()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">
              Loading cryptocurrency data...
            </span>
          </div>
        </div>
      )}

      {/* Coins Grid */}
      {coins && coins.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {coins.map(coin => (
              <CoinCard
                key={coin.id}
                coin={coin}
                onClick={handleCoinClick}
                className="hover:scale-105 transition-transform duration-200"
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 text-sm mb-4">
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
