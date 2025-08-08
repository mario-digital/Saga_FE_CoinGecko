'use client';

import { useMemo } from 'react';

import { CoinData } from '@/types/coingecko';

export interface UseFilteredCoinsParams {
  coins: CoinData[] | undefined;
  filter: string;
}

export interface UseFilteredCoinsReturn {
  filteredCoins: CoinData[];
  activeFilter: string;
  filterCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const filterRanges: Record<string, [number, number]> = {
  all: [1, Infinity],
  top10: [1, 10],
  top50: [1, 50],
  top100: [1, 100],
};

export const useFilteredCoins = ({
  coins,
  filter,
}: UseFilteredCoinsParams): UseFilteredCoinsReturn => {
  const filteredCoins = useMemo(() => {
    if (!coins || coins.length === 0) return [];

    if (filter === 'all' || !filterRanges[filter]) {
      return coins;
    }

    const [minRank, maxRank] = filterRanges[filter];

    return coins.filter(coin => {
      // Handle edge cases for missing or invalid market_cap_rank
      if (!coin.market_cap_rank || typeof coin.market_cap_rank !== 'number') {
        return false;
      }

      return coin.market_cap_rank >= minRank && coin.market_cap_rank <= maxRank;
    });
  }, [coins, filter]);

  return {
    filteredCoins,
    activeFilter: filter,
    filterCount: filteredCoins.length,
    totalCount: coins?.length || 0,
    isLoading: !coins,
    error: null,
  };
};
