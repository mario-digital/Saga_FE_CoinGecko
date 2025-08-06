/**
 * @jest-environment node
 */

// Mock next/server before importing anything else
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(url => ({
    url,
  })),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Map(Object.entries(init?.headers || {})),
    })),
  },
}));

import { GET } from '../route';
import { NextRequest, NextResponse } from 'next/server';

// Mock the global fetch
global.fetch = jest.fn();

describe('GET /api/coins/[coinId]', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should fetch coin detail data successfully', async () => {
    const mockData = {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      market_data: {
        current_price: { usd: 45000 },
        market_cap: { usd: 850000000000 },
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest('http://localhost:3000/api/coins/bitcoin');
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'coins/bitcoin?localization=false&tickers=false&market_data=true'
      ),
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
        },
        next: { revalidate: 60 },
      })
    );

    expect(data).toEqual(mockData);
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=60, stale-while-revalidate=120'
    );
  });

  it('should handle 404 errors when coin not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins/nonexistent'
    );
    const params = Promise.resolve({ coinId: 'nonexistent' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ error: 'Coin not found' });
    expect(response.status).toBe(404);
  });

  it('should handle other API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    const request = new NextRequest('http://localhost:3000/api/coins/bitcoin');
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch coin data' });
    expect(response.status).toBe(500);
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const request = new NextRequest('http://localhost:3000/api/coins/bitcoin');
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch coin data' });
    expect(response.status).toBe(500);
  });

  it('should handle JSON parsing errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const request = new NextRequest('http://localhost:3000/api/coins/bitcoin');
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch coin data' });
    expect(response.status).toBe(500);
  });

  it('should handle special coin IDs with dashes', async () => {
    const mockData = {
      id: 'binance-usd',
      symbol: 'busd',
      name: 'Binance USD',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins/binance-usd'
    );
    const params = Promise.resolve({ coinId: 'binance-usd' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('coins/binance-usd'),
      expect.any(Object)
    );
    expect(data).toEqual(mockData);
  });
});
