/**
 * Custom hook for fetching detailed coin data from CoinGecko API
 */

import useSWR from 'swr';
import { api } from '@/lib/api';
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

export class CorsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorsError';
  }
}

interface UseCoinDetailReturn {
  coin: CoinDetailData | undefined;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export const useCoinDetail = (coinId: string): UseCoinDetailReturn => {
  // Call CoinGecko API directly for static deployment
  const { data, error, isLoading, mutate } = useSWR<CoinDetailData>(
    coinId ? `coin-${coinId}` : null,
    coinId ? () => api.getCoinDetail(coinId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds - rely on server cache instead
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
    // Check for CORS errors first
    if (error.message?.includes('Unable to connect to CoinGecko API')) {
      processedError = new CorsError(
        'Connection issue with CoinGecko API. This is often temporary - please wait a moment and try again. If the issue persists, try refreshing the page.'
      );
    } else if (
      error.status === 404 ||
      error.message?.toLowerCase().includes('not found')
    ) {
      processedError = new CoinNotFoundError(coinId);
    } else if (
      error.status === 429 ||
      error.message?.toLowerCase().includes('rate limit')
    ) {
      const retryAfter = error.retryAfter || 60;
      processedError = new RateLimitError(
        `API rate limit exceeded. The free tier allows 10-30 requests per minute. Please wait ${retryAfter} seconds before trying again.`,
        retryAfter
      );
    } else if (
      error.status >= 500 ||
      error.message?.toLowerCase().includes('server error')
    ) {
      processedError = new NetworkError(
        'Server is experiencing issues. Please try again in a few moments.'
      );
    } else if (
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('fetch')
    ) {
      processedError = new NetworkError(
        'Network connection issue. Please check your internet connection and try again.'
      );
    } else {
      // Generic error with more descriptive message
      processedError = new NetworkError(
        error.message || 'Unable to load coin data. Please try again later.'
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
