/**
 * Custom hook for fetching coin data using SWR
 */

import useSWR from 'swr';
import { CoinData } from '@/types/coingecko';
import { api } from '@/lib/api';
import { SWR_CONFIG } from '@/lib/constants';

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

  const isRateLimited = error?.message?.includes('Rate limit') || false;
  const errorMessage = error?.message || null;

  return {
    coins: data,
    isLoading,
    error: errorMessage,
    isRateLimited,
    refetch: mutate,
  };
};
