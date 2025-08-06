/**
 * Hook for fetching cryptocurrency price history data
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

export interface PriceHistoryData {
  date: string;
  price: number;
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

export const usePriceHistory = (
  coinId: string,
  timeRange: TimeRange
): UsePriceHistoryReturn => {
  const [data, setData] = useState<PriceHistoryData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!coinId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getPriceHistory(coinId, timeRange);

      if (!response || !response.prices) {
        setData([]);
      } else {
        const transformedData = response.prices.map(
          ([timestamp, price]: [number, number]) => ({
            date: formatDate(timestamp),
            price,
          })
        );
        setData(transformedData);
      }
    } catch (err) {
      setError('Failed to fetch price history');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId, timeRange]);

  const retry = () => {
    fetchData();
  };

  return {
    data,
    isLoading,
    error,
    retry,
  };
};
