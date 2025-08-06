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

describe('GET /api/coins', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should fetch coins data successfully with default parameters', async () => {
    const mockData = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000,
        market_cap: 850000000000,
        market_cap_rank: 1,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest('http://localhost:3000/api/coins');
    const response = await GET(request);
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1'
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

  it('should fetch coins data with custom page and per_page parameters', async () => {
    const mockData = [
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3000,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins?page=2&per_page=50'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=2'
      ),
      expect.any(Object)
    );

    expect(data).toEqual(mockData);
  });

  it('should handle API errors when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    const request = new NextRequest('http://localhost:3000/api/coins');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch coins data' });
    expect(response.status).toBe(500);
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const request = new NextRequest('http://localhost:3000/api/coins');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch coins data' });
    expect(response.status).toBe(500);
  });

  it('should handle JSON parsing errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const request = new NextRequest('http://localhost:3000/api/coins');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch coins data' });
    expect(response.status).toBe(500);
  });

  it('should use default values when query parameters are empty strings', async () => {
    const mockData = [];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins?page=&per_page='
    );
    const response = await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('per_page=20&page=1'),
      expect.any(Object)
    );
  });
});
