/**
 * API utility functions for CoinGecko integration
 */

import { CoinsMarketsParams, SearchParams } from '@/types/coingecko';
import {
  API_ENDPOINTS,
  DEFAULT_CURRENCY,
  DEFAULT_PER_PAGE,
  DEFAULT_ORDER,
} from './constants';

export const buildCoinsMarketsUrl = (
  params: Partial<CoinsMarketsParams> = {}
): string => {
  const searchParams = new URLSearchParams({
    vs_currency: params.vs_currency || DEFAULT_CURRENCY,
    order: params.order || DEFAULT_ORDER,
    per_page: String(params.per_page || DEFAULT_PER_PAGE),
    page: String(params.page || 1),
    sparkline: String(params.sparkline || false),
  });

  if (params.ids) {
    searchParams.set('ids', params.ids);
  }

  if (params.category) {
    searchParams.set('category', params.category);
  }

  if (params.price_change_percentage) {
    searchParams.set('price_change_percentage', params.price_change_percentage);
  }

  return `${API_ENDPOINTS.COINS_MARKETS}?${searchParams.toString()}`;
};

export const buildCoinDetailUrl = (coinId: string): string => {
  return `${API_ENDPOINTS.COIN_DETAIL}/${coinId}`;
};

export const buildSearchUrl = (params: SearchParams): string => {
  const searchParams = new URLSearchParams({
    query: params.query,
  });

  return `${API_ENDPOINTS.SEARCH}?${searchParams.toString()}`;
};

export const api = {
  getCoins: async (page: number = 1, perPage: number = 20) => {
    try {
      const response = await fetch(
        `/api/coins?page=${page}&per_page=${perPage}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response) {
        throw new Error('No response received');
      }
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch coins');
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  },

  getCoinDetail: async (coinId: string) => {
    try {
      const response = await fetch(`/api/coins/${coinId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response) {
        throw new Error('No response received');
      }
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch coin detail');
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  },

  searchCoins: async (query: string) => {
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response) {
        throw new Error('No response received');
      }
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to search coins');
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  },

  getPriceHistory: async (coinId: string, timeRange: string) => {
    try {
      const timeRangeToDays: Record<string, number> = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365,
      };
      const days = timeRangeToDays[timeRange] || 7;
      const response = await fetch(
        `/api/coins/${coinId}/history?days=${days}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response) {
        throw new Error('No response received');
      }
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch price history');
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  },
};
