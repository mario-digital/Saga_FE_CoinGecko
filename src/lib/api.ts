/**
 * API utility functions for CoinGecko integration
 * Calls CoinGecko API directly from the client for static deployment
 */

import { CoinsMarketsParams, SearchParams } from '@/types/coingecko';
import { DEFAULT_CURRENCY, DEFAULT_PER_PAGE, DEFAULT_ORDER } from './constants';

// Use the public CoinGecko API directly
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';

// Create headers with API key if available
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['x-cg-demo-api-key'] = API_KEY;
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response | undefined) => {
  if (!response) {
    throw new Error('No response received');
  }
  if (!response.ok) {
    // Create error with status code property for better error handling
    const error: any = new Error();
    error.status = response.status;

    if (response.status === 429) {
      error.message = 'Rate limit exceeded';
      error.retryAfter = 60; // Default to 60 seconds

      // Try to parse retry-after header if available
      const retryAfter = response.headers.get('retry-after');
      if (retryAfter) {
        error.retryAfter = parseInt(retryAfter, 10) || 60;
      }
    } else if (response.status === 404) {
      error.message = 'Resource not found';
    } else if (
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503
    ) {
      error.message = 'Server error. Please try again later.';
    } else if (response.status === 400) {
      error.message = 'Invalid request. Please check your parameters.';
    } else {
      error.message = `API Error: ${response.status} ${response.statusText || 'Unknown error'}`;
    }

    throw error;
  }
  return response.json();
};

// Helper function to handle fetch with CORS error detection
const fetchWithCorsHandling = async (
  url: string,
  options: RequestInit,
  retries = 1
): Promise<Response> => {
  try {
    // Detect mobile browsers for enhanced CORS handling
    const _isMobile =
      typeof window !== 'undefined' &&
      /iPhone|iPad|iPod|Android/i.test(window.navigator?.userAgent || '');

    // Enhanced options for mobile compatibility
    const fetchOptions: RequestInit = {
      ...options,
      mode: 'cors',
      credentials: 'omit', // Don't send cookies for CORS requests
    };

    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error: any) {
    // Check if it's a CORS error (network error with no status)
    // Mobile browsers may throw different error messages
    if (
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('Load failed') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed'))
    ) {
      // This is likely a CORS error
      const corsError: any = new Error('CORS');
      corsError.isCorsError = true;
      corsError.originalError = error;

      // Retry once after a short delay (sometimes CORS errors are transient)
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithCorsHandling(url, options, retries - 1);
      }

      throw corsError;
    }
    throw error;
  }
};

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

  return `${API_BASE_URL}/coins/markets?${searchParams.toString()}`;
};

export const buildCoinDetailUrl = (coinId: string): string => {
  return `${API_BASE_URL}/coins/${coinId}`;
};

export const buildSearchUrl = (params: SearchParams): string => {
  const searchParams = new URLSearchParams({
    query: params.query,
  });

  return `${API_BASE_URL}/search?${searchParams.toString()}`;
};

export const api = {
  getCoins: async (page: number = 1, perPage: number = 20) => {
    try {
      const url = buildCoinsMarketsUrl({ page, per_page: perPage });
      const response = await fetchWithCorsHandling(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error: any) {
      if (error.isCorsError) {
        throw new Error(
          'Unable to connect to CoinGecko API. This might be a temporary issue. Please try again in a moment.'
        );
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  },

  getCoinDetail: async (coinId: string) => {
    try {
      const url = buildCoinDetailUrl(coinId);
      const response = await fetchWithCorsHandling(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error: any) {
      if (error.isCorsError) {
        throw new Error(
          'Unable to connect to CoinGecko API. This might be a temporary issue. Please try again in a moment.'
        );
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  },

  searchCoins: async (query: string) => {
    try {
      const url = buildSearchUrl({ query });
      const response = await fetchWithCorsHandling(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error: any) {
      if (error.isCorsError) {
        throw new Error(
          'Unable to connect to CoinGecko API. This might be a temporary issue. Please try again in a moment.'
        );
      }
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

      const url = `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
      const response = await fetchWithCorsHandling(url, {
        headers: getHeaders(),
      });

      const data = await handleResponse(response);

      // Transform the response to match our expected format
      return {
        prices: data.prices || [],
        market_caps: data.market_caps || [],
        total_volumes: data.total_volumes || [],
      };
    } catch (error: any) {
      if (error.isCorsError) {
        throw new Error(
          'Unable to connect to CoinGecko API. This might be a temporary issue. Please try again in a moment.'
        );
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  },
};
