# CoinGecko API Reference

This document contains all CoinGecko API endpoints used in this project with their specifications, parameters, and response structures.

## Base Configuration

- **Base URL**: `https://api.coingecko.com/api/v3`
- **Authentication**: API key via `x-cg-demo-api-key` header
- **Rate Limit**: ~30 requests/minute (demo tier)
- **Environment Variable**: `NEXT_PUBLIC_COINGECKO_API_KEY` (stored in `.env.local`)

## Endpoints Used in Project

### 1. Coins Market Data

**Endpoint**: `/coins/markets`  
**Purpose**: Get paginated list of coins with market data  
**Used in**: Story 1.1 - Coin List View

#### Parameters

```typescript
interface CoinsMarketsParams {
  vs_currency: string; // Required: 'usd'
  order?: string; // Optional: 'market_cap_desc' (default)
  per_page?: number; // Optional: 1-250, default 100
  page?: number; // Optional: page number, default 1
  sparkline?: boolean; // Optional: include sparkline, default false
  price_change_percentage?: string; // Optional: '1h,24h,7d,14d,30d,200d,1y'
  locale?: string; // Optional: 'en' (default)
  precision?: string; // Optional: decimal places for currency
}
```

#### Response Structure

```typescript
interface CoinMarketData {
  id: string; // Coin identifier
  symbol: string; // Coin symbol (e.g., 'btc')
  name: string; // Coin name (e.g., 'Bitcoin')
  image: string; // Coin logo URL
  current_price: number | null; // Current price in vs_currency
  market_cap: number | null; // Market capitalization
  market_cap_rank: number | null; // Market cap ranking
  fully_diluted_valuation?: number | null; // Optional
  total_volume: number | null; // 24h trading volume
  high_24h?: number | null; // 24h high price (optional)
  low_24h?: number | null; // 24h low price (optional)
  price_change_24h?: number | null; // 24h price change (optional)
  price_change_percentage_24h: number | null; // 24h price change (%)
  market_cap_change_24h?: number | null; // Optional
  market_cap_change_percentage_24h?: number | null; // Optional
  circulating_supply?: number | null; // Optional
  total_supply?: number | null; // Optional
  max_supply?: number | null; // Optional
  ath?: number | null; // All-time high (optional)
  ath_change_percentage?: number | null; // Optional
  ath_date?: string | null; // ISO date (optional)
  atl?: number | null; // All-time low (optional)
  atl_change_percentage?: number | null; // Optional
  atl_date?: string | null; // ISO date (optional)
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string; // ISO date
}
```

#### Example Usage

```typescript
// Basic request for top 100 coins
const url = `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;

// With pagination
const url = `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=2`;
```

### 2. Coin Detail Data

**Endpoint**: `/coins/{coinId}`  
**Purpose**: Get detailed coin information including metadata  
**Used in**: Coin Detail Page (`src/app/coin/page.tsx`)

#### Parameters

```typescript
interface CoinDetailParams {
  id: string; // Required: coin id (e.g., 'bitcoin')
  localization?: boolean; // Optional: include localized data
  tickers?: boolean; // Optional: include ticker data
  market_data?: boolean; // Optional: include market data
  community_data?: boolean; // Optional: include community data
  developer_data?: boolean; // Optional: include developer data
  sparkline?: boolean; // Optional: include 7-day sparkline
}
```

### 3. Coin Historical Chart Data

**Endpoint**: `/coins/{coinId}/market_chart`  
**Purpose**: Get historical price, market cap, and volume data  
**Used in**: Price History Chart (`src/components/PriceHistoryChart.tsx`)

#### Parameters

```typescript
interface MarketChartParams {
  id: string; // Required: coin id
  vs_currency: string; // Required: target currency
  days: string | number; // Required: data up to number of days ago (1, 7, 14, 30, 90, 180, 365, max)
  interval?: string; // Optional: data interval (hourly, daily)
  precision?: string; // Optional: decimal places
}
```

### 4. Search Coins

**Endpoint**: `/search`  
**Purpose**: Search for coins by name or symbol  
**Used in**: Search Command (`src/components/SearchCommand.tsx`)

#### Parameters

```typescript
interface SearchParams {
  query: string; // Required: search term
}
```

## Error Handling

### Common Error Responses

```typescript
interface CoinGeckoError {
  error: string; // Error message
  status?: {
    error_code?: number; // HTTP status code
    error_message?: string; // Detailed error message
  };
}
```

### Rate Limiting

- **Status Code**: 429 (Too Many Requests)
- **Handling**: Implement exponential backoff
- **SWR Configuration**: Use appropriate `refreshInterval` to respect limits

## Implementation Notes

### SWR Configuration

```typescript
// Actual SWR config used in project
const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // 5 seconds
  focusThrottleInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  // Custom retry logic - no retry on 404 or 429
};
```

### Type Definitions Location

All TypeScript interfaces should be defined in:

- `/src/types/coingecko.ts` - API response types
- `/src/lib/api.ts` - API utility functions

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key_here
```

## Future Endpoints (Not Yet Implemented)

### Categories

- `/coins/categories/list` - List all coin categories
- `/coins/categories` - Categories with market data

### Exchange Data

- `/exchanges` - List exchanges
- `/exchanges/{id}/tickers` - Exchange tickers

### Global Data

- `/global` - Global cryptocurrency statistics
- `/global/decentralized_finance_defi` - DeFi statistics

---

**Last Updated**: 2025-08-20  
**Version**: 1.0  
**Maintained by**: Development Team
