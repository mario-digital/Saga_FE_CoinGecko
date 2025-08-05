/**
 * Hook for fetching cryptocurrency price history data
 */

import useSWR from 'swr';
import { fetcher, ApiError } from '@/lib/fetcher';
import { SWR_CONFIG } from '@/lib/constants';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

interface MarketChartApiResponse {
  prices: Array<[number, number]>;
  market_caps: Array<[number, number]>;
  total_volumes: Array<[number, number]>;
}

export interface PriceHistoryData {
  timestamp: number;
  price: number;
  formattedDate: string;
  formattedPrice: string;
}

export interface UsePriceHistoryReturn {
  data: PriceHistoryData[] | undefined;
  isLoading: boolean;
  error: ApiError | null;
  retry: () => void;
}

const timeRangeToDays: Record<TimeRange, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

const formatDateByRange = (timestamp: number, range: TimeRange): string => {
  const date = new Date(timestamp);

  switch (range) {
    case '24h':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    case '7d':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case '30d':
    case '90d':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case '1y':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
    default:
      return date.toLocaleDateString();
  }
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
};

export const usePriceHistory = (
  coinId: string,
  timeRange: TimeRange
): UsePriceHistoryReturn => {
  const days = timeRangeToDays[timeRange];
  // Use our API route instead of direct CoinGecko API
  const url = `/api/coins/${coinId}/history?days=${days}`;

  const { data, error, isLoading, mutate } = useSWR<MarketChartApiResponse>(
    coinId ? url : null,
    fetcher,
    {
      ...SWR_CONFIG,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes cache
    }
  );

  // Transform API data to chart-friendly format
  const transformedData: PriceHistoryData[] | undefined = data?.prices.map(
    ([timestamp, price]) => ({
      timestamp,
      price,
      formattedDate: formatDateByRange(timestamp, timeRange),
      formattedPrice: formatPrice(price),
    })
  );

  return {
    data: transformedData,
    isLoading,
    error: error || null,
    retry: () => mutate(),
  };
};
