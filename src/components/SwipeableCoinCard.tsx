/**
 * Swipeable CoinCard component that reveals additional data on swipe
 */

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react';
import { CoinData } from '@/types/coingecko';
import {
  safeFormatPrice,
  safeFormatMarketCap,
  cn,
  formatLargeNumber,
  formatPercentage,
} from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

interface SwipeableCoinCardProps {
  coin: CoinData;
  onClick?: (coinId: string) => void;
  className?: string;
}

export const SwipeableCoinCard: React.FC<SwipeableCoinCardProps> = ({
  coin,
  onClick,
  className,
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'details'>('main');

  const handleSwipeLeft = useCallback(() => {
    setCurrentView('details');
  }, []);

  const handleSwipeRight = useCallback(() => {
    setCurrentView('main');
  }, []);

  const { swipeState, swipeHandlers } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const handleClick = (): void => {
    // Only trigger click if not swiping
    if (!swipeState.isSwiping && onClick) {
      onClick(coin.id);
    }
  };

  const priceChange = coin.price_change_percentage_24h || 0;
  const changeColor = priceChange >= 0 ? 'text-success' : 'text-danger';

  // Calculate the transform based on swipe state
  const transform =
    swipeState.isSwiping && Math.abs(swipeState.deltaX) > 10
      ? `translateX(${swipeState.deltaX * 0.3}px)`
      : currentView === 'details'
        ? 'translateX(-100%)'
        : 'translateX(0)';

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md dark:shadow-none dark:border dark:border-gray-700',
        'transition-shadow duration-200',
        'min-h-[120px] sm:min-h-[140px]',
        className
      )}
      {...swipeHandlers}
    >
      {/* Swipe indicator */}
      {!swipeState.isSwiping && currentView === 'main' && (
        <div className="absolute top-1 right-1 z-10 sm:hidden bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 flex items-center gap-0.5">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            Swipe
          </span>
          <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400 animate-pulse" />
        </div>
      )}

      {/* Container for both views */}
      <div
        className="relative w-full"
        style={{
          transform,
          transition: swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Main view */}
        <div
          className="p-3 sm:p-4 cursor-pointer select-none"
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${coin.name}`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          {/* Header with coin info */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src={coin.image}
                  alt={`${coin.name} logo`}
                  width={48}
                  height={48}
                  sizes="(max-width: 640px) 40px, 48px"
                  className="rounded-full object-cover w-full h-full"
                  loading="lazy"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-coin.svg';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {coin.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase">
                  {coin.symbol}
                </p>
              </div>
            </div>

            {coin.market_cap_rank && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                #{coin.market_cap_rank}
              </span>
            )}
          </div>

          {/* Price and change */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {safeFormatPrice(coin.current_price)}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 text-xs sm:text-sm font-medium flex-shrink-0',
                  changeColor
                )}
              >
                {priceChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 sm:w-4 sm:h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4 sm:w-4 sm:h-4" />
                )}
                {Math.abs(priceChange).toFixed(2)}%
              </div>
            </div>

            {/* Market Cap */}
            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">
                Market Cap
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                {safeFormatMarketCap(coin.market_cap)}
              </span>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">
                Volume (24h)
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                {safeFormatMarketCap(coin.total_volume)}
              </span>
            </div>
          </div>
        </div>

        {/* Details view (revealed on swipe) */}
        <div className="p-3 sm:p-4 absolute left-full top-0 w-full h-full bg-white dark:bg-gray-800">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Additional Details
              </h4>

              {/* Circulating Supply */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Circulating
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {coin.circulating_supply
                      ? formatLargeNumber(coin.circulating_supply)
                      : 'N/A'}
                  </span>
                </div>

                {/* Max Supply */}
                {coin.max_supply && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Max Supply
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {coin.max_supply
                        ? formatLargeNumber(coin.max_supply)
                        : 'N/A'}
                    </span>
                  </div>
                )}

                {/* ATH */}
                {coin.ath && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      ATH
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {safeFormatPrice(coin.ath)}
                    </span>
                  </div>
                )}

                {/* ATH Change */}
                {coin.ath_change_percentage && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      From ATH
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        coin.ath_change_percentage < 0
                          ? 'text-danger'
                          : 'text-success'
                      )}
                    >
                      {formatPercentage(coin.ath_change_percentage)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (onClick) onClick(coin.id);
              }}
              className="mt-2 text-xs text-primary hover:text-primary/80 font-medium"
            >
              View Full Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCoinCard;
