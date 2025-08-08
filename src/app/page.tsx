'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useMemo,
} from 'react';

import { CoinCard } from '@/components/CoinCard';
import { CoinCardSkeleton } from '@/components/CoinCardSkeleton';
import FilterMarketCap from '@/components/FilterMarketCap';
import { Pagination } from '@/components/Pagination';
import { useCoins } from '@/hooks/useCoins';
import { useFilteredCoins } from '@/hooks/useFilteredCoins';
import { DEFAULT_PER_PAGE } from '@/lib/constants';

// Lazy load mobile-specific components without prefetch to reduce initial load
const SwipeableCoinCard = dynamic(
  () =>
    import(
      /* webpackChunkName: "swipeable-card" */
      '@/components/SwipeableCoinCard'
    ).then(mod => mod.SwipeableCoinCard),
  {
    loading: () => <CoinCardSkeleton />,
    ssr: false,
  }
);

const PullToRefresh = dynamic(
  () =>
    import(
      /* webpackChunkName: "pull-refresh" */
      '@/components/PullToRefresh'
    ).then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div />, // Empty div to prevent layout shift
  }
) as React.ComponentType<{
  onRefresh: () => void;
  disabled: boolean;
  children: React.ReactNode;
}>;

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params immediately
  const urlFilter = searchParams.get('filter');
  const urlPage = searchParams.get('page');

  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (urlPage) {
      const pageNum = parseInt(urlPage, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        return pageNum;
      }
    }
    return 1;
  });

  const [filter, setFilter] = useState<string>(() => {
    if (urlFilter && ['all', 'top10', 'top50', 'top100'].includes(urlFilter)) {
      return urlFilter;
    }
    return 'all';
  });

  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Detect if we're on client side after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync filter state with URL params when they change
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter && ['all', 'top10', 'top50', 'top100'].includes(urlFilter)) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

  const { coins, isLoading, error, isRateLimited, refetch } = useCoins(
    currentPage,
    DEFAULT_PER_PAGE
  );

  // Use the filtered coins hook
  const { filteredCoins, filterCount, totalCount } = useFilteredCoins({
    coins,
    filter,
  });

  const handleCoinClick = useCallback(
    (coinId: string): void => {
      router.push(`/coin?id=${coinId}`);
    },
    [router]
  );

  const handlePageChange = useCallback(
    (page: number): void => {
      setCurrentPage(page);

      // Update URL parameters - maintain consistent order (filter first, then page)
      const params = new URLSearchParams();
      const currentFilter = searchParams.get('filter');
      if (currentFilter && currentFilter !== 'all') {
        params.set('filter', currentFilter);
      }
      params.set('page', page.toString());

      const newUrl = `/?${params.toString()}`;
      // Use Next.js router with scroll to top
      router.push(newUrl as string, { scroll: true });
    },
    [router, searchParams]
  );

  const handleFilterChange = useCallback(
    (newFilter: string): void => {
      setFilter(newFilter);
      setCurrentPage(1); // Reset to page 1 when filter changes

      // Update URL parameters - maintain consistent order (filter first, then page)
      const params = new URLSearchParams();
      if (newFilter && newFilter !== 'all') {
        params.set('filter', newFilter);
      }
      params.set('page', '1');

      const newUrl = `/?${params.toString()}`;
      router.push(newUrl as any);
    },
    [router]
  );

  // Calculate total pages (approximate - CoinGecko doesn't provide total count)
  const estimatedTotalPages = 100; // Conservative estimate

  // Memoize skeleton loaders to prevent re-renders
  const skeletonLoaders = useMemo(
    () =>
      Array.from({ length: DEFAULT_PER_PAGE }).map((_, index) => (
        <CoinCardSkeleton key={index} />
      )),
    []
  );

  if (error) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }

    return (
      <div className="text-center py-12 px-4">
        <div
          className={`${isRateLimited ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border rounded-lg p-6 max-w-md mx-auto`}
        >
          <h2
            className={`text-lg font-semibold ${isRateLimited ? 'text-yellow-900 dark:text-yellow-400' : 'text-red-900 dark:text-red-400'} mb-2`}
          >
            {isRateLimited ? 'Rate Limit Reached' : 'Error Loading Coin Data'}
          </h2>
          <p
            className={`${isRateLimited ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'} text-sm mb-4`}
          >
            {error === 'Load failed'
              ? 'Unable to connect to CoinGecko API. This may be due to network issues or API restrictions. Please check your connection and try again.'
              : error}
          </p>
          {isRateLimited ? (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              The free API tier has a limit of 10-30 requests per minute. Please
              wait a moment before refreshing.
            </p>
          ) : (
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.refresh()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go Back
              </button>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={refetch} disabled={isLoading}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Screen reader only h1 for accessibility */}
        <h1 className="sr-only">Cryptocurrency Market Data</h1>

        {/* Filter Section */}
        <div className="space-y-3 sm:space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {skeletonLoaders}
          </div>
        )}

        {/* Coins Grid */}
        {!isLoading && filteredCoins && filteredCoins.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {filteredCoins.map(coin => (
                <React.Fragment key={coin.id}>
                  {/* Mobile version - only visible on small screens */}
                  <div className="block sm:hidden">
                    {isMounted ? (
                      <SwipeableCoinCard
                        coin={coin}
                        onClick={handleCoinClick}
                        className=""
                      />
                    ) : (
                      <CoinCard
                        coin={coin}
                        onClick={handleCoinClick}
                        className=""
                      />
                    )}
                  </div>
                  {/* Desktop version - only visible on larger screens */}
                  <div className="hidden sm:block">
                    <CoinCard
                      coin={coin}
                      onClick={handleCoinClick}
                      className=""
                    />
                  </div>
                </React.Fragment>
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
                {filter !== 'all'
                  ? 'No Coins Match Filter'
                  : 'No Data Available'}
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
    </PullToRefresh>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
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
