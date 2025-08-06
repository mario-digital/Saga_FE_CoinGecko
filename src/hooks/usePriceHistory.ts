/**
 * Hook for fetching cryptocurrency price history data using SWR
 */

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

export interface PriceHistoryData {
  date: string;
  price: number;
  formattedDate: string; // Add formatted date for chart display
}

export interface UsePriceHistoryReturn {
  data: PriceHistoryData[] | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  // Adjust for UTC
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return `${utcDate.getMonth() + 1}/${utcDate.getDate()}/${utcDate.getFullYear()}`;
};

const formatDateForChart = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const timeRangeToDays: Record<TimeRange, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

export const usePriceHistory = (
  coinId: string,
  timeRange: TimeRange
): UsePriceHistoryReturn => {
  const days = timeRangeToDays[timeRange] || 7;
  
  const { data: rawData, error, isLoading, mutate } = useSWR(
    coinId ? `/api/coins/${coinId}/history?days=${days}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds cache for price history
      refreshInterval: 60000, // Refresh every minute
      shouldRetryOnError: false, // Don't retry on errors
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        // Never retry on 404 - coin doesn't have history
        if (error.status === 404) return;
        
        // Only retry other errors up to 2 times
        if (retryCount >= 2) return;
        
        // Retry other errors after delay
        setTimeout(() => revalidate({ retryCount }), 3000 * Math.pow(2, retryCount));
      },
    }
  );

  // Transform data
  const transformedData = rawData?.prices 
    ? rawData.prices.map(([timestamp, price]: [number, number]) => ({
        date: formatDate(timestamp),
        formattedDate: formatDateForChart(timestamp),
        price,
      }))
    : null;

  // Transform error
  let processedError = null;
  if (error) {
    if (error.status === 429) {
      processedError = 'Rate limit exceeded. Please try again later.';
    } else if (error.status === 404) {
      processedError = 'Price history not found for this coin.';
    } else {
      processedError = error.message || 'Failed to fetch price history';
    }
  }

  return {
    data: transformedData,
    isLoading,
    error: processedError,
    retry: () => mutate(),
  };
};
