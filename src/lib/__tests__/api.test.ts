import { api } from '../api';
import { CoinData, CoinDetailData, PriceHistoryData } from '@/types/coingecko';

// Mock global fetch
global.fetch = jest.fn();

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        '/api/coins?page=1&per_page=20',
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
        '/api/coins?page=2&per_page=50',
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
        '/api/coins/bitcoin',
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
        '/api/coins/binance-usd',
        expect.any(Object)
      );
    });
  });

  describe('getPriceHistory', () => {
    it('fetches price history successfully', async () => {
      const mockPriceHistory: PriceHistoryData = {
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
        '/api/coins/bitcoin/history?days=7',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockPriceHistory);
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
          `/api/coins/bitcoin/history?days=${days}`,
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

      expect(result).toEqual({ prices: [] });
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

      await expect(api.getCoins()).rejects.toThrow();
    });

    it('handles undefined responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(api.getCoins()).rejects.toThrow();
    });
  });
});
