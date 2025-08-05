'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CoinCard } from '@/components/CoinCard';
import { CoinCardSkeleton } from '@/components/CoinCardSkeleton';
import { Pagination } from '@/components/Pagination';
import FilterMarketCap from '@/components/FilterMarketCap';
import { useCoins } from '@/hooks/useCoins';
import { useFilteredCoins } from '@/hooks/useFilteredCoins';
import { DEFAULT_PER_PAGE } from '@/lib/constants';

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filter, setFilter] = useState<string>('all');

  // Initialize filter and page from URL on mount
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter && ['all', 'top10', 'top50', 'top100'].includes(urlFilter)) {
      setFilter(urlFilter);
    }

    const urlPage = searchParams.get('page');
    if (urlPage) {
      const pageNum = parseInt(urlPage, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, [searchParams]);

  const { coins, isLoading, error, refetch } = useCoins(
    currentPage,
    DEFAULT_PER_PAGE
  );

  // Use the filtered coins hook
  const { filteredCoins, filterCount, totalCount } = useFilteredCoins({
    coins,
    filter,
  });

  const handleCoinClick = (coinId: string): void => {
    router.push(`/${coinId}` as any);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());

    const newUrl = `/?${params.toString()}`;
    router.push(newUrl as any);

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilter: string): void => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to page 1 when filter changes

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', newFilter);
    }
    params.set('page', '1');

    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl as any);
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
      {/* Filter Section */}
      <div className="space-y-4">
        <FilterMarketCap value={filter} onChange={handleFilterChange} />

        {/* Filter Count Indicator */}
        {filter !== 'all' && totalCount > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filterCount} of {totalCount.toLocaleString()} coins
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: DEFAULT_PER_PAGE }).map((_, index) => (
            <CoinCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Coins Grid */}
      {!isLoading && filteredCoins && filteredCoins.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCoins.map(coin => (
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
      {!isLoading && filteredCoins.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter !== 'all' ? 'No Coins Match Filter' : 'No Data Available'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {filter !== 'all'
                ? 'Try selecting a different filter or choose "All" to see all coins.'
                : 'Unable to load cryptocurrency data at this time.'}
            </p>
            <button
              onClick={() => {
                if (filter !== 'all') {
                  handleFilterChange('all');
                } else {
                  refetch();
                }
              }}
              className="btn-primary"
            >
              {filter !== 'all' ? 'Clear Filter' : 'Refresh'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: DEFAULT_PER_PAGE }).map((_, index) => (
              <CoinCardSkeleton key={index} />
            ))}
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
