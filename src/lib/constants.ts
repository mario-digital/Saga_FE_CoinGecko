/**
 * Application constants
 */

export const API_BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';
export const DEFAULT_PER_PAGE = 50;
export const MAX_COINS_PER_PAGE = 100;
export const DEFAULT_ORDER = 'market_cap_desc';

export const API_ENDPOINTS = {
  COINS_MARKETS: '/coins/markets',
  COIN_DETAIL: '/coins',
} as const;

export const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
} as const;
