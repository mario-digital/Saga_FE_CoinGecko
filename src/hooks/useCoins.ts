/**
 * Custom hook for fetching coin data using SWR
 */

import useSWR from 'swr';

import { api } from '@/lib/api';
import { SWR_CONFIG } from '@/lib/constants';
import { CoinData } from '@/types/coingecko';

interface UseCoinsReturn {
  coins: CoinData[] | undefined;
  isLoading: boolean;
  error: string | null;
  isRateLimited: boolean;
  refetch: () => void;
}

export const useCoins = (
  page: number = 1,
  perPage: number = 50
): UseCoinsReturn => {
  // Call CoinGecko API directly for static deployment
  const key = `coins-${page}-${perPage}`;

  const { data, error, isLoading, mutate } = useSWR<CoinData[]>(
    key,
    () => api.getCoins(page, perPage),
    SWR_CONFIG
  );

  // Better error message handling
  let errorMessage: string | null = null;
  if (error) {
    if (
      error.message === 'Load failed' ||
      error.message === 'Failed to fetch'
    ) {
      errorMessage =
        'Unable to connect to CoinGecko API. Please check your network connection and try again.';
    } else if (error.message?.includes('Unable to connect')) {
      errorMessage = error.message;
    } else if (error.message?.includes('Rate limit')) {
      errorMessage = error.message;
    } else {
      errorMessage =
        error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  const isRateLimited = error?.message?.includes('Rate limit') || false;

  return {
    coins: data,
    isLoading,
    error: errorMessage,
    isRateLimited,
    refetch: mutate,
  };
};
