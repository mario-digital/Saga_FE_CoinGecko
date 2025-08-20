'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const [hasRetriedOnce, setHasRetriedOnce] = useState<boolean>(false);

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

  // Detect CORS/rate limit errors and set countdown
  const isCorsOrRateLimitError =
    error &&
    (error.toLowerCase().includes('unable to connect') ||
      error.toLowerCase().includes('cors') ||
      error.toLowerCase().includes('network') ||
      error.toLowerCase().includes('rate limit') ||
      isRateLimited);

  // Reset retry flag when page changes
  useEffect(() => {
    setHasRetriedOnce(false);
    setRetryCountdown(0);
  }, [currentPage]);

  // Set countdown when we have a CORS/rate limit error
  useEffect(() => {
    if (isCorsOrRateLimitError && !hasRetriedOnce) {
      setRetryCountdown(45);
    }
  }, [error, isCorsOrRateLimitError, hasRetriedOnce]);

  // Countdown timer
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (
      retryCountdown === 0 &&
      isCorsOrRateLimitError &&
      !hasRetriedOnce
    ) {
      // Auto-retry ONCE when countdown reaches 0
      setHasRetriedOnce(true);
      refetch();
    }
  }, [retryCountdown, isCorsOrRateLimitError, hasRetriedOnce, refetch]);

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

  // Calculate total pages based on filter (DEFAULT_PER_PAGE = 50)
  const getMaxPagesForFilter = (filterValue: string): number => {
    switch (filterValue) {
      case 'top10':
        return 1; // 10 coins / 50 per page = 1 page
      case 'top50':
        return 1; // 50 coins / 50 per page = 1 page
      case 'top100':
        return 2; // 100 coins / 50 per page = 2 pages
      default:
        return 100; // Conservative estimate for 'all'
    }
  };

  const estimatedTotalPages = getMaxPagesForFilter(filter);

  // Redirect to page 1 if current page exceeds max for filter
  useEffect(() => {
    if (currentPage > estimatedTotalPages) {
      handlePageChange(1);
    }
  }, [currentPage, estimatedTotalPages, handlePageChange]);

  // Memoize skeleton loaders to prevent re-renders
  const skeletonLoaders = useMemo(
    () =>
      Array.from({ length: DEFAULT_PER_PAGE }).map((_, index) => (
        <CoinCardSkeleton key={index} />
      )),
    []
  );

  if (error) {
    // Only log actual errors, not handled connection issues
    if (process.env.NODE_ENV === 'development' && !isCorsOrRateLimitError) {
      console.error('API Error:', error);
    }

    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-8">
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-semibold">
                  {isCorsOrRateLimitError
                    ? 'Connection Issue'
                    : 'Error Loading Coin Data'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isCorsOrRateLimitError
                    ? 'Unable to connect to CoinGecko API. This might be a temporary issue.'
                    : error}
                </p>
                {isCorsOrRateLimitError && retryCountdown > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      Retrying automatically in{' '}
                      <strong className="text-foreground">
                        {retryCountdown}
                      </strong>{' '}
                      seconds...
                    </span>
                  </div>
                )}
                {isCorsOrRateLimitError && (
                  <p className="text-xs text-muted-foreground mt-2">
                    If this persists, try refreshing the page or check your
                    connection.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="sm"
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => {
                    setHasRetriedOnce(false);
                    setRetryCountdown(0);
                    refetch();
                  }}
                  disabled={retryCountdown > 0}
                  variant={retryCountdown > 0 ? 'secondary' : 'default'}
                  size="sm"
                >
                  {retryCountdown > 0 ? `Wait ${retryCountdown}s` : 'Try Again'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
