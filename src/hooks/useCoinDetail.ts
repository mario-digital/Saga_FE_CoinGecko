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

export class RateLimitError extends Error {
  retryAfter?: number;
  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

interface UseCoinDetailReturn {
  coin: CoinDetailData | undefined;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export const useCoinDetail = (coinId: string): UseCoinDetailReturn => {
  // Use our API route instead of direct CoinGecko API
  const { data, error, isLoading, mutate } = useSWR<CoinDetailData>(
    coinId ? `/api/coins/${coinId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute cache
      shouldRetryOnError: false, // Don't retry on errors (especially 404s)
      errorRetryCount: 0, // No automatic retries
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        // Never retry on 404 - coin doesn't exist
        if (error.status === 404) return;

        // Only retry other errors up to 3 times with exponential backoff
        if (retryCount >= 3) return;

        // Retry other errors after delay
        setTimeout(
          () => revalidate({ retryCount }),
          5000 * Math.pow(2, retryCount)
        );
      },
    }
  );

  // Transform error into proper error instances
  let processedError = null;
  if (error) {
    if (error.status === 404) {
      processedError = new CoinNotFoundError(coinId);
    } else if (error.status === 429) {
      processedError = new RateLimitError(
        'API rate limit exceeded. The free tier allows 10-30 requests per minute. Please wait a moment before trying again.',
        60 // Suggest waiting 60 seconds
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
