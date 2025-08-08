import {
  api,
  buildCoinsMarketsUrl,
  buildCoinDetailUrl,
  buildSearchUrl,
} from '../api';
import { CoinData, CoinDetailData } from '@/types/coingecko';

// Mock global fetch
global.fetch = jest.fn();

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildCoinsMarketsUrl', () => {
    it('builds URL with default parameters', () => {
      const url = buildCoinsMarketsUrl();
      expect(url).toContain('/coins/markets?');
      expect(url).toContain('vs_currency=usd');
      expect(url).toContain('order=market_cap_desc');
      expect(url).toContain('per_page=50');
      expect(url).toContain('page=1');
      expect(url).toContain('sparkline=false');
    });

    it('builds URL with custom parameters', () => {
      const url = buildCoinsMarketsUrl({
        vs_currency: 'eur',
        order: 'volume_desc',
        per_page: 50,
        page: 2,
        sparkline: true,
      });
      expect(url).toContain('vs_currency=eur');
      expect(url).toContain('order=volume_desc');
      expect(url).toContain('per_page=50');
      expect(url).toContain('page=2');
      expect(url).toContain('sparkline=true');
    });

    it('includes ids parameter when provided', () => {
      const url = buildCoinsMarketsUrl({
        ids: 'bitcoin,ethereum',
      });
      expect(url).toContain('ids=bitcoin%2Cethereum');
    });

    it('includes category parameter when provided', () => {
      const url = buildCoinsMarketsUrl({
        category: 'decentralized-finance-defi',
      });
      expect(url).toContain('category=decentralized-finance-defi');
    });

    it('includes price_change_percentage parameter when provided', () => {
      const url = buildCoinsMarketsUrl({
        price_change_percentage: '1h,24h,7d',
      });
      expect(url).toContain('price_change_percentage=1h%2C24h%2C7d');
    });

    it('builds URL with all optional parameters', () => {
      const url = buildCoinsMarketsUrl({
        vs_currency: 'btc',
        order: 'id_asc',
        per_page: 250,
        page: 3,
        sparkline: true,
        ids: 'bitcoin,ethereum,cardano',
        category: 'smart-contract-platform',
        price_change_percentage: '1h,24h,7d,30d',
      });

      expect(url).toContain('vs_currency=btc');
      expect(url).toContain('order=id_asc');
      expect(url).toContain('per_page=250');
      expect(url).toContain('page=3');
      expect(url).toContain('sparkline=true');
      expect(url).toContain('ids=bitcoin%2Cethereum%2Ccardano');
      expect(url).toContain('category=smart-contract-platform');
      expect(url).toContain('price_change_percentage=1h%2C24h%2C7d%2C30d');
    });

    it('handles empty object parameter', () => {
      const url = buildCoinsMarketsUrl({});
      expect(url).toContain('vs_currency=usd');
      expect(url).toContain('order=market_cap_desc');
      expect(url).toContain('per_page=50');
      expect(url).toContain('page=1');
      expect(url).toContain('sparkline=false');
    });

    it('handles partial parameters with some undefined', () => {
      const url = buildCoinsMarketsUrl({
        vs_currency: undefined,
        order: 'volume_desc',
        per_page: undefined,
        page: 5,
      });
      expect(url).toContain('vs_currency=usd'); // should use default
      expect(url).toContain('order=volume_desc');
      expect(url).toContain('per_page=50'); // should use default
      expect(url).toContain('page=5');
    });
  });

  describe('buildCoinDetailUrl', () => {
    it('builds coin detail URL with coin ID', () => {
      const url = buildCoinDetailUrl('bitcoin');
      expect(url).toBe('https://api.coingecko.com/api/v3/coins/bitcoin');
    });

    it('handles coin IDs with special characters', () => {
      const url = buildCoinDetailUrl('binance-usd');
      expect(url).toBe('https://api.coingecko.com/api/v3/coins/binance-usd');
    });

    it('handles coin IDs with numbers', () => {
      const url = buildCoinDetailUrl('1inch');
      expect(url).toBe('https://api.coingecko.com/api/v3/coins/1inch');
    });

    it('handles long coin IDs', () => {
      const url = buildCoinDetailUrl('cryptocurrency-with-very-long-name');
      expect(url).toBe(
        'https://api.coingecko.com/api/v3/coins/cryptocurrency-with-very-long-name'
      );
    });
  });

  describe('buildSearchUrl', () => {
    it('builds search URL with query', () => {
      const url = buildSearchUrl({ query: 'bitcoin' });
      expect(url).toBe('https://api.coingecko.com/api/v3/search?query=bitcoin');
    });

    it('handles queries with spaces', () => {
      const url = buildSearchUrl({ query: 'bitcoin cash' });
      expect(url).toBe(
        'https://api.coingecko.com/api/v3/search?query=bitcoin+cash'
      );
    });

    it('handles queries with special characters', () => {
      const url = buildSearchUrl({ query: 'BTC/USD' });
      expect(url).toBe(
        'https://api.coingecko.com/api/v3/search?query=BTC%2FUSD'
      );
    });

    it('handles empty query', () => {
      const url = buildSearchUrl({ query: '' });
      expect(url).toBe('https://api.coingecko.com/api/v3/search?query=');
    });
  });

  describe('getCoins', () => {
    it('fetches coins successfully', async () => {
      const mockCoins: CoinData[] = [
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
          circulating_supply: 19500000,
          max_supply: 21000000,
          ath: 69000,
          ath_change_percentage: -34.78,
          last_updated: '2024-01-01T12:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoins,
      });

      const result = await api.getCoins();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.coingecko.com/api/v3/coins/markets?'
        ),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockCoins);
    });

    it('fetches coins with custom page and perPage', async () => {
      const mockCoins: CoinData[] = [];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoins,
      });

      await api.getCoins(2, 50);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
    });

    it('throws error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(api.getCoins()).rejects.toThrow('Internal Server Error');
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(api.getCoins()).rejects.toThrow('Network error');
    });
  });

  describe('getCoinDetail', () => {
    it('fetches coin detail successfully', async () => {
      const mockCoinDetail: Partial<CoinDetailData> = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCoinDetail,
      });

      const result = await api.getCoinDetail('bitcoin');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/bitcoin',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockCoinDetail);
    });

    it('throws error when coin not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(api.getCoinDetail('nonexistent')).rejects.toThrow(
        'Not Found'
      );
    });

    it('handles special coin IDs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await api.getCoinDetail('binance-usd');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/binance-usd',
        expect.any(Object)
      );
    });
  });

  describe('getPriceHistory', () => {
    it('fetches price history successfully', async () => {
      const mockPriceHistory = {
        prices: [
          [1609459200000, 29000],
          [1609545600000, 32000],
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPriceHistory,
      });

      const result = await api.getPriceHistory('bitcoin', '7d');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?'
        ),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual({
        prices: mockPriceHistory.prices,
        market_caps: [],
        total_volumes: [],
      });
    });

    it('maps time range to days correctly', async () => {
      const timeRangeMap = {
        '24h': '1',
        '7d': '7',
        '30d': '30',
        '90d': '90',
        '1y': '365',
      };

      for (const [timeRange, days] of Object.entries(timeRangeMap)) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ prices: [] }),
        });

        await api.getPriceHistory('bitcoin', timeRange as any);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`days=${days}`),
          expect.any(Object)
        );
      }
    });

    it('throws error when price history fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(api.getPriceHistory('bitcoin', '7d')).rejects.toThrow(
        'Bad Request'
      );
    });

    it('handles empty price data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prices: [] }),
      });

      const result = await api.getPriceHistory('bitcoin', '30d');

      expect(result).toEqual({
        prices: [],
        market_caps: [],
        total_volumes: [],
      });
    });
  });

  describe('searchCoins', () => {
    it('searches coins successfully', async () => {
      const mockSearchResults = {
        coins: [
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
          { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      const result = await api.searchCoins('bitcoin');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/search?query=bitcoin',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockSearchResults);
    });

    it('encodes search query with special characters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ coins: [] }),
      });

      await api.searchCoins('BTC/USD & test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/search?query=BTC%2FUSD+%26+test',
        expect.any(Object)
      );
    });

    it('handles empty search query', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ coins: [] }),
      });

      await api.searchCoins('');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/search?query=',
        expect.any(Object)
      );
    });

    it('throws error when search fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(api.searchCoins('test')).rejects.toThrow('Bad Request');
    });

    it('handles search with no statusText', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: '',
      });

      await expect(api.searchCoins('test')).rejects.toThrow(
        'API Error: undefined Unknown error'
      );
    });

    it('handles network errors during search', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(api.searchCoins('test')).rejects.toThrow('Network error');
    });

    it('handles non-Error objects in search', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('String error');

      await expect(api.searchCoins('test')).rejects.toThrow('String error');
    });

    it('handles undefined response in search', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(api.searchCoins('test')).rejects.toThrow(
        'No response received'
      );
    });
  });

  describe('error handling', () => {
    it('preserves original error messages', async () => {
      const errorMessage = 'Custom error message';
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      await expect(api.getCoins()).rejects.toThrow(errorMessage);
    });

    it('handles non-Error objects', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('String error');

      await expect(api.getCoins()).rejects.toThrow('String error');
    });

    it('handles undefined responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(api.getCoins()).rejects.toThrow('No response received');
    });

    it('handles missing statusText for getCoins', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: '',
      });

      await expect(api.getCoins()).rejects.toThrow(
        'API Error: undefined Unknown error'
      );
    });

    it('handles missing statusText for getCoinDetail', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: '',
      });

      await expect(api.getCoinDetail('bitcoin')).rejects.toThrow(
        'API Error: undefined Unknown error'
      );
    });

    it('handles missing statusText for getPriceHistory', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: '',
      });

      await expect(api.getPriceHistory('bitcoin', '7d')).rejects.toThrow(
        'API Error: undefined Unknown error'
      );
    });

    it('handles non-Error objects in getCoinDetail', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce({ code: 'ERROR_CODE' });

      await expect(api.getCoinDetail('bitcoin')).rejects.toThrow(
        '[object Object]'
      );
    });

    it('handles non-Error objects in getPriceHistory', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(123);

      await expect(api.getPriceHistory('bitcoin', '7d')).rejects.toThrow('123');
    });

    it('handles undefined response in getCoinDetail', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(api.getCoinDetail('bitcoin')).rejects.toThrow(
        'No response received'
      );
    });

    it('handles undefined response in getPriceHistory', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(api.getPriceHistory('bitcoin', '7d')).rejects.toThrow(
        'No response received'
      );
    });

    it('handles null errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(null);

      await expect(api.getCoins()).rejects.toThrow('null');
    });

    it('handles boolean errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(false);

      await expect(api.searchCoins('test')).rejects.toThrow('false');
    });

    it('handles array errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(['error1', 'error2']);

      await expect(api.getCoinDetail('bitcoin')).rejects.toThrow(
        'error1,error2'
      );
    });
  });

  describe('getPriceHistory edge cases', () => {
    it('uses default days for unknown time range', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prices: [] }),
      });

      await api.getPriceHistory('bitcoin', 'unknown' as any);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('days=7'),
        expect.any(Object)
      );
    });

    it('handles custom time range not in map', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prices: [] }),
      });

      await api.getPriceHistory('bitcoin', '2h' as any);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('days=7'),
        expect.any(Object)
      );
    });
  });
});
