import { z } from 'zod';

// Runtime schema for CoinData
export const CoinDataSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number().nullable(),
  market_cap: z.number().nullable(),
  market_cap_rank: z.number().nullable(),
  fully_diluted_valuation: z.number().nullable().optional(),
  total_volume: z.number().nullable(),
  high_24h: z.number().nullable().optional(),
  low_24h: z.number().nullable().optional(),
  price_change_24h: z.number().nullable().optional(),
  price_change_percentage_24h: z.number().nullable(),
  market_cap_change_24h: z.number().nullable().optional(),
  market_cap_change_percentage_24h: z.number().nullable().optional(),
  circulating_supply: z.number().nullable().optional(),
  total_supply: z.number().nullable().optional(),
  max_supply: z.number().nullable().optional(),
  ath: z.number().nullable().optional(),
  ath_change_percentage: z.number().nullable().optional(),
  ath_date: z.string().nullable().optional(),
  atl: z.number().nullable().optional(),
  atl_change_percentage: z.number().nullable().optional(),
  atl_date: z.string().nullable().optional(),
  roi: z
    .object({
      times: z.number(),
      currency: z.string(),
      percentage: z.number(),
    })
    .nullable()
    .optional(),
  last_updated: z.string(),
});

export const CoinsResponseSchema = z.array(CoinDataSchema);

// Schema for search coin
export const SearchCoinSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  market_cap_rank: z.number().nullable(),
  thumb: z.string(),
});

export const SearchResponseSchema = z.object({
  coins: z.array(SearchCoinSchema),
  exchanges: z.array(z.unknown()),
  categories: z.array(z.unknown()),
});

// Schema for coin detail - partial/flexible for testing and API variations
export const CoinDetailDataSchema = z
  .object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
    asset_platform_id: z.string().nullable().optional(),
    description: z
      .object({
        en: z.string(),
      })
      .optional(),
    links: z
      .object({
        homepage: z.array(z.string()),
        blockchain_site: z.array(z.string()),
        official_forum_url: z.array(z.string()),
        chat_url: z.array(z.string()),
        announcement_url: z.array(z.string()),
        twitter_screen_name: z.string().nullable(),
        facebook_username: z.string().nullable(),
        bitcointalk_thread_identifier: z
          .union([z.string(), z.number()])
          .nullable(),
        telegram_channel_identifier: z.string().nullable(),
        subreddit_url: z.string().nullable(),
        repos_url: z.object({
          github: z.array(z.string()),
          bitbucket: z.array(z.string()),
        }),
      })
      .partial()
      .optional(), // Make all link fields optional
    image: z
      .object({
        thumb: z.string(),
        small: z.string(),
        large: z.string(),
      })
      .optional(),
    market_cap_rank: z.number().nullable().optional(),
    market_data: z
      .object({
        current_price: z.record(z.string(), z.number().nullable()),
        market_cap: z.record(z.string(), z.number().nullable()),
        total_volume: z.record(z.string(), z.number().nullable()),
        price_change_percentage_24h: z.number().nullable(),
        price_change_percentage_7d: z.number().nullable(),
        price_change_percentage_30d: z.number().nullable(),
        price_change_percentage_1y: z.number().nullable(),
        ath: z.record(z.string(), z.number().nullable()),
        ath_date: z.record(z.string(), z.string().nullable()),
        atl: z.record(z.string(), z.number().nullable()),
        atl_date: z.record(z.string(), z.string().nullable()),
        circulating_supply: z.number().nullable(),
        total_supply: z.number().nullable(),
        max_supply: z.number().nullable(),
      })
      .partial()
      .optional(), // Make all market_data fields optional
    categories: z.array(z.string()).optional(),
    platforms: z
      .record(z.string(), z.string().nullable())
      .nullable()
      .optional(),
  })
  .passthrough(); // Allow additional fields that may come from API

// Schema for price history
export const PriceHistorySchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
  market_caps: z.array(z.tuple([z.number(), z.number()])).optional(),
  total_volumes: z.array(z.tuple([z.number(), z.number()])).optional(),
});

// Infer types from schemas
export type CoinData = z.infer<typeof CoinDataSchema>;
export type CoinsResponse = z.infer<typeof CoinsResponseSchema>;
export type SearchCoin = z.infer<typeof SearchCoinSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type CoinDetailData = z.infer<typeof CoinDetailDataSchema>;
export type PriceHistory = z.infer<typeof PriceHistorySchema>;

// Custom error class for API validation
export class APIValidationError extends Error {
  public zodError: z.ZodError;

  constructor(zodError: z.ZodError) {
    super('API response validation failed');
    this.name = 'APIValidationError';
    this.zodError = zodError;
  }
}
