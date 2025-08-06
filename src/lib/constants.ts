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
  SEARCH: '/search',
} as const;

export const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  onErrorRetry: (
    error: any,
    _key: string,
    _config: any,
    revalidate: any,
    { retryCount }: any
  ) => {
    // Don't retry on 404
    if (error.status === 404) return;

    // Don't retry on 429 (rate limit) - user must wait
    if (error.status === 429) return;

    // Only retry up to 3 times
    if (retryCount >= 3) return;

    // Exponential backoff for other errors
    setTimeout(
      () => revalidate({ retryCount }),
      5000 * Math.pow(2, retryCount)
    );
  },
} as const;
