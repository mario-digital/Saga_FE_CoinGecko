/**
 * API utility functions for CoinGecko integration
 */

import { CoinsMarketsParams } from '@/types/coingecko';
import { API_ENDPOINTS, DEFAULT_CURRENCY, DEFAULT_PER_PAGE, DEFAULT_ORDER } from './constants';

export const buildCoinsMarketsUrl = (params: Partial<CoinsMarketsParams> = {}): string => {
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