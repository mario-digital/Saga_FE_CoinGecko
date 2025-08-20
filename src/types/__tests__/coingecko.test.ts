// Import everything to ensure full coverage
import * as CoinGeckoTypes from '../coingecko';
import {
  CoinData,
  CoinDetailData,
  CoinsMarketsParams,
  ApiError,
  ApiResponse,
  LoadingState,
  PaginationInfo,
  CoinCardProps,
  PaginationProps,
  SearchCoin,
  SearchResponse,
  SearchParams,
} from '../coingecko';

describe('CoinGecko Types', () => {
  describe('Type exports', () => {
    it('should export CoinData type', () => {
      const coinData: CoinData = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://example.com/bitcoin.png',
        current_price: 45000,
        market_cap: 850000000000,
        market_cap_rank: 1,
        total_volume: 25000000000,
        price_change_percentage_24h: 2.5,
        last_updated: '2024-01-01T12:00:00.000Z',
      };
      expect(coinData).toBeDefined();
    });

    it('should export CoinDetailData type', () => {
      const coinDetail: CoinDetailData = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
      };
      expect(coinDetail).toBeDefined();
    });
  });

  describe('CoinsMarketsParams', () => {
    it('should allow valid market parameters', () => {
      const params: CoinsMarketsParams = {
        vs_currency: 'usd',
        ids: 'bitcoin,ethereum',
        category: 'defi',
        order: 'market_cap_desc',
        per_page: 50,
        page: 1,
        sparkline: true,
        price_change_percentage: '1h,24h,7d',
        locale: 'en',
        precision: '2',
      };
      expect(params.vs_currency).toBe('usd');
      expect(params.order).toBe('market_cap_desc');
    });

    it('should allow partial parameters', () => {
      const params: CoinsMarketsParams = {
        vs_currency: 'eur',
      };
      expect(params.vs_currency).toBe('eur');
      expect(params.page).toBeUndefined();
    });
  });

  describe('ApiError', () => {
    it('should have correct structure', () => {
      const error: ApiError = {
        status: {
          error_code: 404,
          error_message: 'Not found',
        },
      };
      expect(error.status.error_code).toBe(404);
      expect(error.status.error_message).toBe('Not found');
    });
  });

  describe('ApiResponse', () => {
    it('should handle success response', () => {
      const response: ApiResponse<CoinData[]> = {
        data: [
          {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            image: 'https://example.com/bitcoin.png',
            current_price: 45000,
            market_cap: 850000000000,
            market_cap_rank: 1,
            total_volume: 25000000000,
            price_change_percentage_24h: 2.5,
            last_updated: '2024-01-01T12:00:00.000Z',
          },
        ],
      };
      expect(response.data).toHaveLength(1);
      expect(response.error).toBeUndefined();
    });

    it('should handle error response', () => {
      const response: ApiResponse<CoinData[]> = {
        error: 'API rate limit exceeded',
        message: 'Please try again later',
      };
      expect(response.data).toBeUndefined();
      expect(response.error).toBe('API rate limit exceeded');
    });
  });

  describe('LoadingState', () => {
    it('should accept all valid states', () => {
      const states: LoadingState[] = ['idle', 'loading', 'success', 'error'];
      states.forEach(state => {
        const currentState: LoadingState = state;
        expect(currentState).toBe(state);
      });
    });
  });

  describe('PaginationInfo', () => {
    it('should have correct structure', () => {
      const pagination: PaginationInfo = {
        currentPage: 1,
        totalPages: 10,
        perPage: 20,
        hasNext: true,
        hasPrevious: false,
      };
      expect(pagination.currentPage).toBe(1);
      expect(pagination.hasNext).toBe(true);
      expect(pagination.hasPrevious).toBe(false);
    });
  });

  describe('CoinCardProps', () => {
    it('should accept required and optional props', () => {
      const props: CoinCardProps = {
        coin: {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          image: 'https://example.com/bitcoin.png',
          current_price: 45000,
          market_cap: 850000000000,
          market_cap_rank: 1,
          total_volume: 25000000000,
          price_change_percentage_24h: 2.5,
          last_updated: '2024-01-01T12:00:00.000Z',
        },
        onClick: jest.fn(),
        className: 'custom-class',
      };
      expect(props.coin.id).toBe('bitcoin');
      expect(props.onClick).toBeDefined();
      expect(props.className).toBe('custom-class');
    });

    it('should work with only required props', () => {
      const props: CoinCardProps = {
        coin: {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          image: 'https://example.com/ethereum.png',
          current_price: 3000,
          market_cap: 350000000000,
          market_cap_rank: 2,
          total_volume: 15000000000,
          price_change_percentage_24h: 1.5,
          last_updated: '2024-01-01T12:00:00.000Z',
        },
      };
      expect(props.coin.id).toBe('ethereum');
      expect(props.onClick).toBeUndefined();
    });
  });

  describe('PaginationProps', () => {
    it('should have correct structure', () => {
      const props: PaginationProps = {
        currentPage: 2,
        totalPages: 5,
        onPageChange: jest.fn(),
        disabled: false,
        className: 'pagination',
      };
      expect(props.currentPage).toBe(2);
      expect(props.totalPages).toBe(5);
      expect(props.onPageChange).toBeDefined();
    });
  });

  describe('SearchCoin', () => {
    it('should have correct structure', () => {
      const searchCoin: SearchCoin = {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        market_cap_rank: 1,
        thumb: 'https://example.com/thumb.png',
      };
      expect(searchCoin.id).toBe('bitcoin');
      expect(searchCoin.market_cap_rank).toBe(1);
    });
  });

  describe('SearchResponse', () => {
    it('should have correct structure', () => {
      const response: SearchResponse = {
        coins: [
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            market_cap_rank: 1,
            thumb: 'https://example.com/thumb.png',
          },
        ],
        exchanges: [],
        categories: [],
      };
      expect(response.coins).toHaveLength(1);
      expect(response.exchanges).toEqual([]);
      expect(response.categories).toEqual([]);
    });
  });

  describe('SearchParams', () => {
    it('should have query parameter', () => {
      const params: SearchParams = {
        query: 'bitcoin',
      };
      expect(params.query).toBe('bitcoin');
    });
  });

  describe('Module exports', () => {
    it('should export all types from module', () => {
      // Verify module is imported
      expect(CoinGeckoTypes).toBeDefined();

      // Test that re-exported types from schemas work correctly
      const coin: CoinGeckoTypes.CoinData = {
        id: 'test',
        symbol: 'tst',
        name: 'Test Coin',
        image: 'https://test.com/image.png',
        current_price: 100,
        market_cap: 1000000,
        market_cap_rank: 10,
        total_volume: 50000,
        price_change_percentage_24h: 5,
        last_updated: '2024-01-01T00:00:00Z',
      };
      expect(coin).toBeDefined();
    });
  });

  describe('CoinData with optional fields', () => {
    it('should handle all optional fields', () => {
      const coinWithOptionals: CoinData = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://example.com/bitcoin.png',
        current_price: 45000,
        market_cap: 850000000000,
        market_cap_rank: 1,
        fully_diluted_valuation: 900000000000,
        total_volume: 25000000000,
        high_24h: 46000,
        low_24h: 44000,
        price_change_24h: 1000,
        price_change_percentage_24h: 2.5,
        market_cap_change_24h: 10000000000,
        market_cap_change_percentage_24h: 1.2,
        circulating_supply: 19000000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: 69000,
        ath_change_percentage: -35,
        ath_date: '2021-11-10T00:00:00Z',
        atl: 100,
        atl_change_percentage: 45000,
        atl_date: '2013-01-01T00:00:00Z',
        roi: {
          times: 450,
          currency: 'usd',
          percentage: 45000,
        },
        last_updated: '2024-01-01T12:00:00.000Z',
      };
      expect(coinWithOptionals.fully_diluted_valuation).toBe(900000000000);
      expect(coinWithOptionals.roi?.times).toBe(450);
    });

    it('should handle nullable fields', () => {
      const coinWithNulls: CoinData = {
        id: 'test',
        symbol: 'tst',
        name: 'Test',
        image: 'https://test.com/image.png',
        current_price: 100,
        market_cap: null as any, // Testing null handling
        market_cap_rank: 100,
        total_volume: null as any, // Testing null handling
        price_change_percentage_24h: null as any, // Testing null handling
        last_updated: '2024-01-01T00:00:00Z',
      };
      expect(coinWithNulls.market_cap).toBeNull();
    });
  });

  describe('CoinsMarketsParams with all order types', () => {
    const orderTypes: Array<CoinsMarketsParams['order']> = [
      'market_cap_desc',
      'market_cap_asc',
      'volume_desc',
      'volume_asc',
      'id_asc',
      'id_desc',
    ];

    orderTypes.forEach(order => {
      it(`should accept order type: ${order}`, () => {
        const params: CoinsMarketsParams = {
          vs_currency: 'usd',
          order,
        };
        expect(params.order).toBe(order);
      });
    });
  });

  describe('CoinDetailData with full structure', () => {
    it('should handle complete detail data', () => {
      const detailData: CoinDetailData = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        asset_platform_id: null,
        description: {
          en: 'Bitcoin is the first cryptocurrency',
        },
        links: {
          homepage: ['https://bitcoin.org'],
          blockchain_site: ['https://blockchain.info'],
          official_forum_url: ['https://bitcointalk.org'],
          chat_url: ['https://discord.gg/bitcoin'],
          announcement_url: [],
          twitter_screen_name: 'bitcoin',
          facebook_username: 'bitcoin',
          bitcointalk_thread_identifier: null,
          telegram_channel_identifier: 'bitcoin',
          subreddit_url: 'https://reddit.com/r/bitcoin',
          repos_url: {
            github: ['https://github.com/bitcoin/bitcoin'],
            bitbucket: [],
          },
        },
        image: {
          thumb: 'https://example.com/thumb.png',
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        market_cap_rank: 1,
        market_data: {
          current_price: { usd: 45000, eur: 41000 },
          market_cap: { usd: 850000000000, eur: 770000000000 },
          total_volume: { usd: 25000000000, eur: 23000000000 },
          price_change_percentage_24h: 2.5,
          price_change_percentage_7d: 5.2,
          price_change_percentage_30d: 10.3,
          price_change_percentage_1y: 150.5,
          ath: { usd: 69000, eur: 62000 },
          ath_date: {
            usd: '2021-11-10T00:00:00Z',
            eur: '2021-11-10T00:00:00Z',
          },
          atl: { usd: 100, eur: 90 },
          atl_date: {
            usd: '2013-01-01T00:00:00Z',
            eur: '2013-01-01T00:00:00Z',
          },
          circulating_supply: 19000000,
          total_supply: 21000000,
          max_supply: 21000000,
        },
        categories: ['Cryptocurrency', 'Store of Value'],
        platforms: {
          ethereum: '0x123...',
          'binance-smart-chain': '0x456...',
        },
      };
      expect(detailData.market_data?.current_price?.usd).toBe(45000);
      expect(detailData.categories).toContain('Cryptocurrency');
      expect(detailData.platforms?.ethereum).toBe('0x123...');
    });

    it('should handle detail data with null max_supply', () => {
      const detailData: CoinDetailData = {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        market_data: {
          max_supply: null,
        } as any,
      };
      expect(detailData.market_data?.max_supply).toBeNull();
    });
  });

  describe('Type re-exports from schemas', () => {
    it('should properly re-export types from schemas', () => {
      // This ensures the import and re-export lines are covered
      const coinFromSchema: CoinData = {
        id: 'schema-test',
        symbol: 'st',
        name: 'Schema Test',
        image: 'https://test.com/image.png',
        current_price: 100,
        market_cap: 1000000,
        market_cap_rank: 100,
        total_volume: 50000,
        price_change_percentage_24h: 5,
        last_updated: '2024-01-01T00:00:00Z',
      };

      const detailFromSchema: CoinDetailData = {
        id: 'schema-detail-test',
        symbol: 'sdt',
        name: 'Schema Detail Test',
      };

      expect(coinFromSchema.id).toBe('schema-test');
      expect(detailFromSchema.id).toBe('schema-detail-test');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle empty arrays in SearchResponse', () => {
      const emptyResponse: SearchResponse = {
        coins: [],
        exchanges: [],
        categories: [],
      };
      expect(emptyResponse.coins.length).toBe(0);
    });

    it('should handle undefined optional properties', () => {
      const minimalCoin: CoinData = {
        id: 'minimal',
        symbol: 'min',
        name: 'Minimal Coin',
        image: '',
        current_price: 0,
        market_cap: 0,
        market_cap_rank: 0,
        total_volume: 0,
        price_change_percentage_24h: 0,
        last_updated: '',
      };
      expect(minimalCoin.fully_diluted_valuation).toBeUndefined();
      expect(minimalCoin.roi).toBeUndefined();
    });

    it('should handle all LoadingState transitions', () => {
      let state: LoadingState = 'idle';
      expect(state).toBe('idle');

      state = 'loading';
      expect(state).toBe('loading');

      state = 'success';
      expect(state).toBe('success');

      state = 'error';
      expect(state).toBe('error');
    });
  });
});
