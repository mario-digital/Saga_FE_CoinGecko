/**
 * Price changes component showing percentage changes across different timeframes
 */

import { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPercentage, getPercentageChangeColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceChangesProps {
  priceChanges: {
    '24h': number;
    '7d': number;
    '30d': number;
    '1y': number;
  };
}

interface PriceChangeItemProps {
  label: string;
  value: number;
  description?: string;
}

const PriceChangeItem: FC<PriceChangeItemProps> = ({
  label,
  value,
  description,
}) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const colorClass = getPercentageChangeColor(value);

  const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
        {label}
      </span>
      <div className={`flex items-center gap-1 sm:gap-2 ${colorClass}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-lg sm:text-xl lg:text-2xl font-bold">
          {formatPercentage(value)}
        </span>
      </div>
      {description && (
        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 hidden sm:block">
          {description}
        </span>
      )}
    </div>
  );
};

export const PriceChanges: FC<PriceChangesProps> = ({ priceChanges }) => {
  // Determine overall trend
  const positiveCount = Object.values(priceChanges).filter(v => v > 0).length;
  const negativeCount = Object.values(priceChanges).filter(v => v < 0).length;

  let trendBadge = null;
  if (positiveCount === 4) {
    trendBadge = (
      <Badge variant="default" className="bg-success">
        Bullish Trend
      </Badge>
    );
  } else if (negativeCount === 4) {
    trendBadge = <Badge variant="destructive">Bearish Trend</Badge>;
  } else if (positiveCount > negativeCount) {
    trendBadge = <Badge variant="secondary">Mostly Positive</Badge>;
  } else if (negativeCount > positiveCount) {
    trendBadge = <Badge variant="secondary">Mostly Negative</Badge>;
  } else {
    trendBadge = <Badge variant="outline">Mixed</Badge>;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Price Performance</CardTitle>
            <CardDescription>
              Percentage changes across different time periods
            </CardDescription>
          </div>
          {trendBadge}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <PriceChangeItem
            label="24 Hours"
            value={priceChanges['24h']}
            description="Daily"
          />
          <PriceChangeItem
            label="7 Days"
            value={priceChanges['7d']}
            description="Weekly"
          />
          <PriceChangeItem
            label="30 Days"
            value={priceChanges['30d']}
            description="Monthly"
          />
          <PriceChangeItem
            label="1 Year"
            value={priceChanges['1y']}
            description="Yearly"
          />
        </div>
      </CardContent>
    </Card>
  );
};
