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

// Mock @vercel/kv module
jest.mock('@vercel/kv', () => ({
  kv: {
    keys: jest.fn(),
    ttl: jest.fn(),
    get: jest.fn(),
  },
}));

import { GET } from '../route';
import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';

describe('GET /api/cache/kv-keys', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset environment variables
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return unavailable when KV is not configured', async () => {
    const request = new NextRequest('http://localhost:3000/api/cache/kv-keys');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({
      available: false,
      keys: [],
      error: 'KV not configured',
    });
  });

  it('should return keys when KV is configured', async () => {
    // Set environment variables
    process.env.KV_REST_API_URL = 'https://test.upstash.io';
    process.env.KV_REST_API_TOKEN = 'test-token';

    // Mock KV responses
    const mockKeys = ['test:key1', 'test:key2', 'coins:page:1'];
    (kv.keys as jest.Mock).mockResolvedValue(mockKeys);
    (kv.ttl as jest.Mock).mockImplementation(key => {
      if (key === 'test:key1') return Promise.resolve(300); // 5 minutes
      if (key === 'test:key2') return Promise.resolve(-1); // No expiry
      return Promise.resolve(60); // 1 minute
    });
    (kv.get as jest.Mock).mockImplementation(key => {
      if (key === 'test:key1') return Promise.resolve({ data: 'value1' });
      if (key === 'test:key2') return Promise.resolve({ data: 'value2' });
      return Promise.resolve({ coins: [] });
    });

    const request = new NextRequest('http://localhost:3000/api/cache/kv-keys');
    const response = await GET(request);
    const data = await response.json();

    expect(data.available).toBe(true);
    expect(data.totalKeys).toBe(3);
    expect(data.keys).toHaveLength(3);
    expect(data.keys[0]).toMatchObject({
      key: 'test:key1',
      ttl: 300,
      type: 'test',
    });
    expect(data.keys[0].size).toBeGreaterThan(0);
  });

  it('should handle no expiry TTL correctly', async () => {
    process.env.KV_REST_API_URL = 'https://test.upstash.io';
    process.env.KV_REST_API_TOKEN = 'test-token';

    const mockKeys = ['persistent:key'];
    (kv.keys as jest.Mock).mockResolvedValue(mockKeys);
    (kv.ttl as jest.Mock).mockResolvedValue(-1); // No expiry
    (kv.get as jest.Mock).mockResolvedValue({ persistent: 'data' });

    const request = new NextRequest('http://localhost:3000/api/cache/kv-keys');
    const response = await GET(request);
    const data = await response.json();

    expect(data.keys[0].ttl).toBe('No expiry');
  });

  it('should limit keys to 50 for performance', async () => {
    process.env.KV_REST_API_URL = 'https://test.upstash.io';
    process.env.KV_REST_API_TOKEN = 'test-token';

    // Create 60 mock keys
    const mockKeys = Array.from({ length: 60 }, (_, i) => `key:${i}`);
    (kv.keys as jest.Mock).mockResolvedValue(mockKeys);
    (kv.ttl as jest.Mock).mockResolvedValue(100);
    (kv.get as jest.Mock).mockResolvedValue({ data: 'value' });

    const request = new NextRequest('http://localhost:3000/api/cache/kv-keys');
    const response = await GET(request);
    const data = await response.json();

    expect(data.totalKeys).toBe(60);
    expect(data.keys).toHaveLength(50); // Limited to 50
  });

  it('should handle errors when fetching key details', async () => {
    process.env.KV_REST_API_URL = 'https://test.upstash.io';
    process.env.KV_REST_API_TOKEN = 'test-token';

    const mockKeys = ['error:key', 'valid:key'];
    (kv.keys as jest.Mock).mockResolvedValue(mockKeys);

    // Mock ttl - first call fails, second succeeds
    (kv.ttl as jest.Mock)
      .mockRejectedValueOnce(new Error('TTL error'))
      .mockResolvedValueOnce(100);

    // Mock get - only called for second key (first failed at ttl)
    (kv.get as jest.Mock).mockResolvedValueOnce({ data: 'valid' });

    const request = new NextRequest('http://localhost:3000/api/cache/kv-keys');
    const response = await GET(request);
    const data = await response.json();

    expect(data.keys).toHaveLength(2);

    // First key had an error
    expect(data.keys[0]).toMatchObject({
      key: 'error:key',
      ttl: 'Unknown',
      size: 0,
      type: 'error', // When error occurs, type is 'error'
    });

    // Second key processed successfully
    expect(data.keys[1].key).toBe('valid:key');
    expect(data.keys[1].ttl).toBe(100);
    expect(data.keys[1].size).toBeGreaterThan(0);
    expect(data.keys[1].type).toBe('valid'); // Extracted from 'valid:key'
  });

  it('should extract type from key format correctly', async () => {
    process.env.KV_REST_API_URL = 'https://test.upstash.io';
    process.env.KV_REST_API_TOKEN = 'test-token';

    const mockKeys = [
      'coins:page:1',
      'coin-detail:bitcoin',
      'price-history:ethereum:7d',
      'no-colon-key',
    ];
    (kv.keys as jest.Mock).mockResolvedValue(mockKeys);
    (kv.ttl as jest.Mock).mockResolvedValue(100);
    (kv.get as jest.Mock).mockResolvedValue({ data: 'value' });

    const request = new NextRequest('http://localhost:3000/api/cache/kv-keys');
    const response = await GET(request);
    const data = await response.json();

    expect(data.keys[0].type).toBe('coins');
    expect(data.keys[1].type).toBe('coin-detail');
    expect(data.keys[2].type).toBe('price-history');
    expect(data.keys[3].type).toBe('no-colon-key'); // When no colon, the whole key becomes the type
  });

  it('should handle KV service errors gracefully', async () => {
    process.env.KV_REST_API_URL = 'https://test.upstash.io';
    process.env.KV_REST_API_TOKEN = 'test-token';

    (kv.keys as jest.Mock).mockRejectedValue(
      new Error('KV service unavailable')
    );

    const request = new NextRequest('http://localhost:3000/api/cache/kv-keys');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      available: false,
      keys: [],
      error: 'KV service unavailable',
    });
  });

  it('should handle empty keys array', async () => {
    process.env.KV_REST_API_URL = 'https://test.upstash.io';
    process.env.KV_REST_API_TOKEN = 'test-token';

    (kv.keys as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/cache/kv-keys');
    const response = await GET(request);
    const data = await response.json();

    expect(data.available).toBe(true);
    expect(data.totalKeys).toBe(0);
    expect(data.keys).toEqual([]);
  });
});
