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
import { rateLimiter } from '@/lib/rate-limiter';

describe('GET /api/cache/stats', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    await apiCache.clear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return cache statistics with zero values initially', async () => {
    const request = new NextRequest('http://localhost:3000/api/cache/stats');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toMatchObject({
      cache: {
        hits: 0,
        misses: 0,
        size: 0,
        itemCount: 0,
        hitRate: 0,
        hitRatePercentage: '0.00%',
      },
      rateLimiter: {
        requestsInWindow: 0,
        queueSize: 0,
        activeRequests: 0,
        isBusy: false,
      },
    });

    expect(data.timestamp).toBeDefined();
    expect(response.headers.get('Cache-Control')).toBe(
      'no-cache, no-store, must-revalidate'
    );
  });

  it('should return updated cache statistics after cache operations', async () => {
    // Simulate cache operations
    await apiCache.set('test-key', { data: 'test' }, 5000);
    await apiCache.get('test-key'); // Hit
    await apiCache.get('non-existent'); // Miss

    const request = new NextRequest('http://localhost:3000/api/cache/stats');
    const response = await GET(request);
    const data = await response.json();

    expect(data.cache).toMatchObject({
      hits: 1,
      misses: 1,
      itemCount: 1,
      hitRate: 0.5,
      hitRatePercentage: '50.00%',
    });
    expect(data.cache.size).toBeGreaterThan(0);
  });

  it('should calculate hit rate percentage correctly', async () => {
    // Simulate multiple cache operations
    await apiCache.set('key1', 'value1');
    await apiCache.set('key2', 'value2');
    await apiCache.get('key1'); // Hit
    await apiCache.get('key1'); // Hit
    await apiCache.get('key2'); // Hit
    await apiCache.get('key3'); // Miss

    const request = new NextRequest('http://localhost:3000/api/cache/stats');
    const response = await GET(request);
    const data = await response.json();

    expect(data.cache.hits).toBe(3);
    expect(data.cache.misses).toBe(1);
    expect(data.cache.hitRate).toBe(0.75);
    expect(data.cache.hitRatePercentage).toBe('75.00%');
  });

  it('should include rate limiter statistics', async () => {
    const request = new NextRequest('http://localhost:3000/api/cache/stats');
    const response = await GET(request);
    const data = await response.json();

    expect(data.rateLimiter).toHaveProperty('requestsInWindow');
    expect(data.rateLimiter).toHaveProperty('windowStart');
    expect(data.rateLimiter).toHaveProperty('queueSize');
    expect(data.rateLimiter).toHaveProperty('activeRequests');
    expect(data.rateLimiter).toHaveProperty('isBusy');
  });

  it('should handle errors gracefully', async () => {
    // Mock getStats to throw an error
    jest.spyOn(apiCache, 'getStats').mockImplementationOnce(() => {
      throw new Error('Stats error');
    });

    const request = new NextRequest('http://localhost:3000/api/cache/stats');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Failed to get cache statistics' });
    expect(response.status).toBe(500);
  });
});
