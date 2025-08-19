/**
 * TypeScript interfaces for CoinGecko API responses
 * Based on the /coins/markets endpoint specification
 */

// Import and re-export types from schemas for backward compatibility
import {
  CoinData as SchemaCoinData,
  CoinDetailData as SchemaCoinDetailData,
} from '@/schemas/coingecko';
export type CoinData = SchemaCoinData;
export type CoinDetailData = SchemaCoinDetailData;

// Original interface definitions (types now come from schemas)
interface _CoinDataLegacy {
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
  order?:
    | 'market_cap_desc'
    | 'market_cap_asc'
    | 'volume_desc'
    | 'volume_asc'
    | 'id_asc'
    | 'id_desc';
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
  onClick?: (_coinId: string) => void;
  className?: string;
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (_page: number) => void;
  disabled?: boolean;
  className?: string;
};

// Search API types
export interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
}

export interface SearchResponse {
  coins: SearchCoin[];
  exchanges: Array<unknown>; // Not used
  categories: Array<unknown>; // Not used
}

export interface SearchParams {
  query: string;
}

// Coin Detail API types (legacy - actual type comes from schemas)
export interface _CoinDetailDataLegacy {
  id: string;
  symbol: string;
  name: string;
  asset_platform_id: string | null;
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    bitcointalk_thread_identifier: string | null;
    telegram_channel_identifier: string;
    subreddit_url: string | null;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: { [key: string]: number };
    market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_1y: number;
    ath: { [key: string]: number };
    ath_date: { [key: string]: string };
    atl: { [key: string]: number };
    atl_date: { [key: string]: string };
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
  };
  categories: string[];
  platforms: { [key: string]: string };
}
