/**
 * Custom hook for fetching detailed coin data from CoinGecko API
 */

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { CoinDetailData } from '@/types/coingecko';

export class CoinNotFoundError extends Error {
  constructor(coinId: string) {
    super(`Coin with ID "${coinId}" not found`);
    this.name = 'CoinNotFoundError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

interface UseCoinDetailReturn {
  coin: CoinDetailData | undefined;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export const useCoinDetail = (coinId: string): UseCoinDetailReturn => {
  const queryParams = new URLSearchParams({
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
    sparkline: 'false',
  });

  const { data, error, isLoading, mutate } = useSWR<CoinDetailData>(
    coinId ? `/coins/${coinId}?${queryParams.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute cache
    }
  );

  // Transform error into proper error instances
  let processedError = null;
  if (error) {
    if (error.status === 404) {
      processedError = new CoinNotFoundError(coinId);
    } else if (error.status === 429) {
      processedError = new NetworkError(
        'Rate limit exceeded. Please try again later.'
      );
    } else {
      processedError = new NetworkError(
        error.message || 'Failed to fetch coin data'
      );
    }
  }

  return {
    coin: data,
    error: processedError,
    isLoading,
    retry: () => mutate(),
  };
};
