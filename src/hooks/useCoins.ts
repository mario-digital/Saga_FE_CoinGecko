/**
 * Custom hook for fetching coin data using SWR
 */

import useSWR from 'swr';
import { CoinData } from '@/types/coingecko';
import { fetcher } from '@/lib/fetcher';
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
  // Use our API route instead of direct CoinGecko API
  const url = `/api/coins?page=${page}&per_page=${perPage}`;

  const { data, error, isLoading, mutate } = useSWR<CoinData[]>(
    url,
    fetcher,
    SWR_CONFIG
  );

  const isRateLimited = error?.status === 429;
  const errorMessage = isRateLimited
    ? 'API rate limit exceeded. Please wait a minute before refreshing.'
    : error?.message || null;

  return {
    coins: data,
    isLoading,
    error: errorMessage,
    isRateLimited,
    refetch: mutate,
  };
};
