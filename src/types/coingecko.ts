/**
 * TypeScript interfaces for CoinGecko API responses
 * Based on the /coins/markets endpoint specification
 */

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h?: number;
  low_24h?: number;
  price_change_24h?: number;
  price_change_percentage_24h: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  ath?: number;
  ath_change_percentage?: number;
  ath_date?: string;
  atl?: number;
  atl_change_percentage?: number;
  atl_date?: string;
  roi?: {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
}

export interface CoinsMarketsParams {
  vs_currency: string;
  ids?: string;
  category?: string;
  order?: 'market_cap_desc' | 'market_cap_asc' | 'volume_desc' | 'volume_asc' | 'id_asc' | 'id_desc';
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string;
  locale?: string;
  precision?: string;
}

export interface ApiError {
  status: {
    error_code: number;
    error_message: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  perPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Utility types for component props
export type CoinCardProps = {
  coin: CoinData;
  onClick?: (coinId: string) => void;
  className?: string;
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};