/**
 * Market statistics component for coin detail page
 * Displays market cap, volume, supply, and all-time high/low
 */

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Coins,
  Trophy,
} from 'lucide-react';
import { FC } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  formatCurrency,
  formatLargeNumber,
  formatDate,
  formatPercentage,
} from '@/lib/utils';
import { CoinDetailData } from '@/types/coingecko';

interface CoinStatsProps {
  marketData: CoinDetailData['market_data'];
  rank: number;
}

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
}

const StatCard: FC<StatCardProps> = ({ title, value, description, icon }) => (
  <Card className="h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
        {value}
      </div>
      {description && (
        <CardDescription className="text-xs mt-1 line-clamp-2">
          {description}
        </CardDescription>
      )}
    </CardContent>
  </Card>
);

export const CoinStats: FC<CoinStatsProps> = ({ marketData, rank }) => {
  const marketCap = marketData.market_cap.usd;
  const volume24h = marketData.total_volume.usd;
  const circulatingSupply = marketData.circulating_supply;
  const totalSupply = marketData.total_supply;
  const maxSupply = marketData.max_supply;
  const athPrice = marketData.ath.usd;
  const athDate = marketData.ath_date.usd;
  const atlPrice = marketData.atl.usd;
  const atlDate = marketData.atl_date.usd;
  const currentPrice = marketData.current_price.usd;

  // Calculate ATH change percentage
  const athChangePercent = ((currentPrice - athPrice) / athPrice) * 100;
  const atlChangePercent = ((currentPrice - atlPrice) / atlPrice) * 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <StatCard
        title="Market Cap"
        value={formatCurrency(marketCap)}
        description={`Rank #${rank}`}
        icon={<DollarSign className="h-4 w-4" />}
      />

      <StatCard
        title="24h Volume"
        value={formatCurrency(volume24h)}
        description={`${((volume24h / marketCap) * 100).toFixed(2)}% of cap`}
        icon={<BarChart3 className="h-4 w-4" />}
      />

      <StatCard
        title="Circulating"
        value={formatLargeNumber(circulatingSupply)}
        description={
          maxSupply
            ? `${((circulatingSupply / maxSupply) * 100).toFixed(1)}% of max`
            : totalSupply
              ? `${((circulatingSupply / totalSupply) * 100).toFixed(1)}% of total`
              : undefined
        }
        icon={<Coins className="h-4 w-4" />}
      />

      <StatCard
        title="All-Time High"
        value={formatCurrency(athPrice)}
        description={`${formatDate(athDate)} (${formatPercentage(athChangePercent)})`}
        icon={<TrendingUp className="h-4 w-4 text-success" />}
      />

      <StatCard
        title="All-Time Low"
        value={formatCurrency(atlPrice)}
        description={`${formatDate(atlDate)} (${formatPercentage(atlChangePercent)})`}
        icon={<TrendingDown className="h-4 w-4 text-danger" />}
      />

      <StatCard
        title="Max Supply"
        value={maxSupply ? formatLargeNumber(maxSupply) : 'No Limit'}
        description={
          maxSupply
            ? `${formatLargeNumber(maxSupply - circulatingSupply)} left`
            : 'Unlimited'
        }
        icon={<Trophy className="h-4 w-4" />}
      />
    </div>
  );
};
