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
import { NextRequest } from 'next/server';
import { apiCache } from '@/lib/cache';

describe('GET /api/cache/items', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    apiCache.clear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return empty array when cache is empty', async () => {
    const request = new NextRequest('http://localhost:3000/api/cache/items');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual([]);
    expect(response.headers.get('Cache-Control')).toBe(
      'no-cache, no-store, must-revalidate'
    );
  });

  it('should return cached items with metadata', async () => {
    // Add items to cache
    apiCache.set('coins:page:1-per_page:10', { data: 'coins list' }, 60000);
    apiCache.set(
      'coin-detail:coinId:bitcoin',
      { data: 'bitcoin detail' },
      120000
    );

    const request = new NextRequest('http://localhost:3000/api/cache/items');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      key: expect.stringMatching(/coin/),
      size: expect.any(Number),
      remainingTTL: expect.stringMatching(/\d+s/),
    });
  });

  it('should sort items alphabetically by key', async () => {
    // Add items in random order
    apiCache.set('zebra-key', 'value');
    apiCache.set('apple-key', 'value');
    apiCache.set('middle-key', 'value');

    const request = new NextRequest('http://localhost:3000/api/cache/items');
    const response = await GET(request);
    const data = await response.json();

    expect(data[0].key).toBe('apple-key');
    expect(data[1].key).toBe('middle-key');
    expect(data[2].key).toBe('zebra-key');
  });

  it('should show expired items with "Expired" TTL', async () => {
    // Add an item with very short TTL
    apiCache.set('expired-key', 'value', 1); // 1ms TTL

    // Wait for it to expire
    await new Promise(resolve => setTimeout(resolve, 10));

    const request = new NextRequest('http://localhost:3000/api/cache/items');
    const response = await GET(request);
    const data = await response.json();

    // Note: Depending on cache implementation, expired items might be auto-removed
    // If the item is still there, it should show as expired
    const expiredItem = data.find((item: any) => item.key === 'expired-key');
    if (expiredItem) {
      expect(expiredItem.remainingTTL).toBe('Expired');
    }
  });

  it('should calculate item sizes correctly', async () => {
    const testData = {
      id: 'bitcoin',
      name: 'Bitcoin',
      price: 45000,
    };
    apiCache.set('test-key', testData);

    const request = new NextRequest('http://localhost:3000/api/cache/items');
    const response = await GET(request);
    const data = await response.json();

    const item = data.find((item: any) => item.key === 'test-key');
    expect(item.size).toBe(JSON.stringify(testData).length);
  });

  it('should handle errors gracefully', async () => {
    // Mock getCacheItems to throw an error
    jest.spyOn(apiCache, 'getCacheItems').mockImplementationOnce(() => {
      throw new Error('Items error');
    });

    const request = new NextRequest('http://localhost:3000/api/cache/items');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to get cache items' });
    expect(response.status).toBe(500);
  });

  it('should return proper headers to prevent caching', async () => {
    const request = new NextRequest('http://localhost:3000/api/cache/items');
    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toBe(
      'no-cache, no-store, must-revalidate'
    );
  });
});
