/**
 * CoinCard component for displaying individual cryptocurrency information
 */

import React from 'react';
import Image from 'next/image';
import { CoinData } from '@/types/coingecko';
import { formatPrice, formatMarketCap, formatPercentageChange, getPercentageChangeColor, cn } from '@/lib/utils';

interface CoinCardProps {
  coin: CoinData;
  onClick?: (coinId: string) => void;
  className?: string;
}

export const CoinCard: React.FC<CoinCardProps> = ({ 
  coin, 
  onClick, 
  className 
}) => {
  const handleClick = (): void => {
    if (onClick) {
      onClick(coin.id);
    }
  };

  const changeColor = getPercentageChangeColor(coin.price_change_percentage_24h);

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Header with coin info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8">
            <Image
              src={coin.image}
              alt={`${coin.name} logo`}
              fill
              sizes="32px"
              className="rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-coin.svg';
              }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {coin.name}
            </h3>
            <p className="text-xs text-gray-500 uppercase">
              {coin.symbol}
            </p>
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
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(coin.current_price)}
          </span>
          <span className={cn('text-sm font-medium', changeColor)}>
            {formatPercentageChange(coin.price_change_percentage_24h)}
          </span>
        </div>

        {/* Market Cap */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Market Cap</span>
          <span className="font-medium text-gray-700">
            {formatMarketCap(coin.market_cap)}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Volume (24h)</span>
          <span className="font-medium text-gray-700">
            {formatMarketCap(coin.total_volume)}
          </span>
        </div>
      </div>
    </div>
  );
};