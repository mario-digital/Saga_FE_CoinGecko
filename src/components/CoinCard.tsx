/**
 * CoinCard component for displaying individual cryptocurrency information
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { safeFormatPrice, safeFormatMarketCap, cn } from '@/lib/utils';
import { CoinData } from '@/types/coingecko';

interface CoinCardProps {
  coin: CoinData;
  onClick?: (_coinId: string) => void;
  className?: string;
}

export const CoinCard: React.FC<CoinCardProps> = ({
  coin,
  onClick,
  className,
}) => {
  const handleClick = (): void => {
    if (onClick) {
      onClick(coin.id);
    }
  };

  const priceChange = coin.price_change_percentage_24h || 0;
  const changeColor = priceChange >= 0 ? 'text-success' : 'text-danger';

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl',
        'shadow-md shadow-gray-200/60 hover:shadow-xl hover:shadow-gray-300/60',
        'dark:shadow-none dark:border dark:border-gray-700',
        'border border-gray-100 dark:border-gray-700',
        'transition-all duration-200 cursor-pointer',
        'p-3 sm:p-4', // Responsive padding
        'min-h-[120px] sm:min-h-[140px]', // Ensure touch target height
        'hover:scale-[1.02] active:scale-[0.98]',
        'hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 dark:hover:from-gray-800 dark:hover:to-gray-800',
        'select-none', // Prevent text selection on touch
        '-webkit-tap-highlight-color-transparent', // Remove tap highlight
        'prevent-layout-shift coin-card-container',
        className
      )}
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
          <span className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 border border-blue-100 dark:border-blue-800/50 shadow-sm">
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
  );
};
