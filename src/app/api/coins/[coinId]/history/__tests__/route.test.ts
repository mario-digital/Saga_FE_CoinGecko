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

describe('GET /api/coins/[coinId]/history', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should fetch price history data successfully with default days', async () => {
    const mockData = {
      prices: [
        [1609459200000, 29000],
        [1609545600000, 32000],
      ],
      market_caps: [
        [1609459200000, 540000000000],
        [1609545600000, 595000000000],
      ],
      total_volumes: [
        [1609459200000, 40000000000],
        [1609545600000, 45000000000],
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins/bitcoin/history'
    );
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily'
      ),
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
        },
        next: { revalidate: 300 },
      })
    );

    expect(data).toEqual(mockData);
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=300, stale-while-revalidate=600'
    );
  });

  it('should fetch price history with custom days parameter', async () => {
    const mockData = {
      prices: [[1609459200000, 29000]],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins/bitcoin/history?days=30'
    );
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily'
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

    const request = new NextRequest(
      'http://localhost:3000/api/coins/bitcoin/history'
    );
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch price history' });
    expect(response.status).toBe(500);
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/coins/bitcoin/history'
    );
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch price history' });
    expect(response.status).toBe(500);
  });

  it('should handle JSON parsing errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins/bitcoin/history'
    );
    const params = Promise.resolve({ coinId: 'bitcoin' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to fetch price history' });
    expect(response.status).toBe(500);
  });

  it('should handle different coin IDs', async () => {
    const mockData = { prices: [] };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins/ethereum/history'
    );
    const params = Promise.resolve({ coinId: 'ethereum' });
    const response = await GET(request, { params });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('coins/ethereum/market_chart'),
      expect.any(Object)
    );
  });

  it('should use default days when parameter is empty string', async () => {
    const mockData = { prices: [] };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/coins/bitcoin/history?days='
    );
    const params = Promise.resolve({ coinId: 'bitcoin' });
    await GET(request, { params });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('days=7'),
      expect.any(Object)
    );
  });
});
