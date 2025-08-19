/**
 * Header component for coin detail page
 * Displays coin logo, name, price, and rank
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  formatCurrency,
  formatPercentage,
  getPercentageChangeColor,
} from '@/lib/utils';
import { CoinDetailData } from '@/types/coingecko';

interface CoinDetailHeaderProps {
  coin: CoinDetailData;
}

export const CoinDetailHeader: FC<CoinDetailHeaderProps> = ({ coin }) => {
  const currentPrice = coin.market_data?.current_price.usd || 0;
  const priceChange24h = coin.market_data?.price_change_percentage_24h || 0;
  const isPositive = priceChange24h >= 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Image
          src={coin.image?.large || '/placeholder.png'}
          alt={`${coin.name} logo`}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {coin.name}
            </h1>
            <span className="text-xl text-gray-500 dark:text-gray-400">
              {coin.symbol.toUpperCase()}
            </span>
            <Badge variant="secondary">Rank #{coin.market_cap_rank}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(currentPrice)}
            </span>
            <div
              className={`flex items-center gap-1 ${getPercentageChangeColor(
                priceChange24h
              )}`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">
                {formatPercentage(priceChange24h)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
