/**
 * CoinCard component for displaying individual cryptocurrency information
 */

import React from 'react';
import Image from 'next/image';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CoinData } from '@/types/coingecko';
import { safeFormatPrice, safeFormatMarketCap, cn } from '@/lib/utils';

interface CoinCardProps {
  coin: CoinData;
  onClick?: (coinId: string) => void;
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
  const changeColor = priceChange >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Header with coin info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12">
            <Image
              src={coin.image}
              alt={`${coin.name} logo`}
              fill
              sizes="48px"
              className="rounded-full object-cover"
              loading="lazy"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-coin.svg';
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{coin.name}</h3>
            <p className="text-sm text-gray-500 uppercase">{coin.symbol}</p>
          </div>
        </div>

        {coin.market_cap_rank && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            #{coin.market_cap_rank}
          </span>
        )}
      </div>

      {/* Price and change */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            {safeFormatPrice(coin.current_price)}
          </span>
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              changeColor
            )}
          >
            {priceChange >= 0 ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            {Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>

        {/* Market Cap */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Market Cap</span>
          <span className="font-medium text-gray-700">
            {safeFormatMarketCap(coin.market_cap)}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Volume (24h)</span>
          <span className="font-medium text-gray-700">
            {safeFormatMarketCap(coin.total_volume)}
          </span>
        </div>
      </div>
    </div>
  );
};
