/**
 * Tests for cache.ts
 */

// We need to test the real cache implementation, not the mock
// The jest.setup.js mocks @/lib/cache for other tests, but we need the real one here
jest.unmock('@/lib/cache');

// Mock @vercel/kv module
jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    keys: jest.fn().mockResolvedValue([]),
    ttl: jest.fn().mockResolvedValue(-1),
    ping: jest.fn().mockResolvedValue('PONG'),
    dbsize: jest.fn().mockResolvedValue(0),
  },
}));

import { apiCache, getCacheKey, CACHE_TTL, getContainerAge } from '../cache';

// Mock LRUCache
jest.mock('lru-cache', () => {
  return {
    LRUCache: jest.fn().mockImplementation(() => {
      const store = new Map();
      const metadata = new Map();

      return {
        get: jest.fn((key: string) => {
          const item = store.get(key);
          if (item && metadata.has(key)) {
            const meta = metadata.get(key);
            if (meta.expires && meta.expires < Date.now()) {
              store.delete(key);
              metadata.delete(key);
              return undefined;
            }
          }
          return item;
        }),
        set: jest.fn((key: string, value: any, options?: { ttl?: number }) => {
          store.set(key, value);
          if (options?.ttl) {
            metadata.set(key, { expires: Date.now() + options.ttl });
          }
        }),
        has: jest.fn((key: string) => {
          const item = store.get(key);
          if (item && metadata.has(key)) {
            const meta = metadata.get(key);
            if (meta.expires && meta.expires < Date.now()) {
              store.delete(key);
              metadata.delete(key);
              return false;
            }
          }
          return store.has(key);
        }),
        peek: jest.fn((key: string) => store.get(key)),
        delete: jest.fn((key: string) => {
          const result = store.delete(key);
          metadata.delete(key);
          return result;
        }),
        clear: jest.fn(() => {
          store.clear();
          metadata.clear();
        }),
        getRemainingTTL: jest.fn((key: string) => {
          const meta = metadata.get(key);
          if (meta?.expires) {
            return Math.max(0, meta.expires - Date.now());
          }
          return 0;
        }),
        entries: jest.fn(function* () {
          for (const [key, value] of store.entries()) {
            yield [key, value];
          }
        }),
        get size() {
          return store.size;
        },
        get calculatedSize() {
          return Array.from(store.values()).reduce((acc, val) => {
            try {
              return acc + JSON.stringify(val).length;
            } catch {
              return acc + 1000;
            }
          }, 0);
        },
      };
    }),
  };
});

describe('Cache Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Clear the cache before each test
    await apiCache.clear();
  });

  describe('Basic Cache Operations', () => {
    it('should get and set cache values', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };

      // Initially cache miss
      expect(await apiCache.get(key)).toBeUndefined();

      // Set value
      await apiCache.set(key, value);

      // Now cache hit
      expect(await apiCache.get(key)).toEqual(value);
    });

    it('should track hits and misses', async () => {
      const key = 'test-key';
      const value = { data: 'test' };

      // Initial stats
      const initialStats = apiCache.getStats();
      const initialMisses = initialStats.misses;

      // Cache miss
      await apiCache.get(key);
      let stats = apiCache.getStats();
      expect(stats.misses).toBe(initialMisses + 1);

      // Set value
      await apiCache.set(key, value);

      // Cache hit
      const initialHits = stats.hits;
      await apiCache.get(key);
      stats = apiCache.getStats();
      expect(stats.hits).toBe(initialHits + 1);
    });

    it('should set cache with TTL', async () => {
      const key = 'ttl-key';
      const value = { data: 'ttl-test' };
      const ttl = 5000; // 5 seconds

      await apiCache.set(key, value, ttl);
      expect(await apiCache.get(key)).toEqual(value);
    });

    it('should check if key exists in cache', async () => {
      const key = 'exists-key';
      const value = { data: 'exists' };

      expect(await apiCache.has(key)).toBe(false);

      await apiCache.set(key, value);

      expect(await apiCache.has(key)).toBe(true);
    });

    it('should delete items from cache', async () => {
      const key = 'delete-key';
      const value = { data: 'delete' };

      await apiCache.set(key, value);
      expect(await apiCache.has(key)).toBe(true);

      const result = await apiCache.delete(key);
      expect(result).toBe(true);
      expect(await apiCache.has(key)).toBe(false);
    });

    it('should clear entire cache', async () => {
      await apiCache.set('key1', 'value1');
      await apiCache.set('key2', 'value2');
      await apiCache.set('key3', 'value3');

      const stats = apiCache.getStats();
      expect(stats.itemCount).toBeGreaterThan(0);

      await apiCache.clear();

      const clearedStats = apiCache.getStats();
      expect(clearedStats.itemCount).toBe(0);
    });

    it('should get stale items from cache', async () => {
      const key = 'stale-key';
      const value = { data: 'stale' };

      await apiCache.set(key, value);

      // getStale should return the value without updating stats
      const staleValue = await apiCache.getStale(key);
      expect(staleValue).toEqual(value);
    });
  });

  describe('Cache Statistics', () => {
    it('should calculate hit rate correctly', async () => {
      const key1 = 'stat-key1';
      const key2 = 'stat-key2';
      const value = { data: 'stats' };

      // 2 misses
      await apiCache.get(key1);
      await apiCache.get(key2);

      // Set values
      await apiCache.set(key1, value);
      await apiCache.set(key2, value);

      // 2 hits
      await apiCache.get(key1);
      await apiCache.get(key2);

      const stats = apiCache.getStats();
      expect(stats.hitRate).toBe(0.5); // 2 hits / 4 total = 0.5
      expect(stats.hitRatePercentage).toBe('50.00%');
    });

    it('should handle zero total requests', async () => {
      // Clear stats by creating new cache
      await apiCache.clear();

      const stats = apiCache.getStats();
      expect(stats.hitRate).toBe(0);
      expect(stats.hitRatePercentage).toBe('0.00%');
    });

    it('should track cache size and item count', async () => {
      const data = { test: 'data', value: 123 };

      await apiCache.set('item1', data);
      await apiCache.set('item2', data);

      const stats = apiCache.getStats();
      expect(stats.itemCount).toBe(2);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should track LRU and KV hit rates', async () => {
      const key = 'rate-test';
      const value = { data: 'rate' };

      // Set in cache (goes to LRU)
      await apiCache.set(key, value);

      // Hit from LRU
      await apiCache.get(key);

      const stats = apiCache.getStats();
      expect(stats.lruHits).toBeGreaterThan(0);
      expect(stats.lruHitRate).toBeDefined();
      expect(stats.kvHitRate).toBeDefined();
    });
  });

  describe('Cache Items Management', () => {
    it('should get list of cached items with metadata', async () => {
      await apiCache.set('item1', { data: 'one' }, 60000);
      await apiCache.set('item2', { data: 'two' }, 120000);
      await apiCache.set('item3', { data: 'three' });

      const items = apiCache.getCacheItems();

      expect(items).toHaveLength(3);
      expect(items[0]).toHaveProperty('key');
      expect(items[0]).toHaveProperty('size');
      expect(items[0]).toHaveProperty('remainingTTL');
    });

    it('should sort cache items by key', async () => {
      await apiCache.set('zebra', 'z');
      await apiCache.set('alpha', 'a');
      await apiCache.set('beta', 'b');

      const items = apiCache.getCacheItems();

      expect(items[0].key).toBe('alpha');
      expect(items[1].key).toBe('beta');
      expect(items[2].key).toBe('zebra');
    });

    it('should show expired TTL correctly', async () => {
      // Mock expired TTL
      const mockGetRemainingTTL = jest.fn(() => -1000);
      const originalCache = (apiCache as any).cache;
      originalCache.getRemainingTTL = mockGetRemainingTTL;

      await apiCache.set('expired-item', 'value');

      const items = apiCache.getCacheItems();
      const expiredItem = items.find(item => item.key === 'expired-item');

      expect(expiredItem?.remainingTTL).toBe('Expired');
    });
  });

  describe('Request Deduplication', () => {
    it.skip('should deduplicate concurrent requests', async () => {
      const key = 'dedupe-key';
      const value = { data: 'dedupe' };
      let fetchCount = 0;
      const fetcher = jest.fn().mockImplementation(() => {
        fetchCount++;
        return Promise.resolve(value);
      });

      // Clear cache to ensure fresh state
      await apiCache.clear();

      // Make two concurrent requests for the same key
      const promise1 = apiCache.dedupeRequest(key, fetcher);
      const promise2 = apiCache.dedupeRequest(key, fetcher);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both should return the same value
      expect(result1).toEqual(value);
      expect(result2).toEqual(value);

      // Fetcher should only be called once due to deduplication
      expect(fetchCount).toBe(1);
    });

    it('should return cached value without fetching', async () => {
      const key = 'cached-dedupe';
      const value = { data: 'cached' };
      const fetcher = jest.fn().mockResolvedValue(value);

      // Pre-populate cache
      await apiCache.set(key, value);

      // Request should return cached value
      const result = await apiCache.dedupeRequest(key, fetcher);

      expect(result).toEqual(value);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should handle fetch errors and return stale data', async () => {
      const key = 'error-dedupe';
      const staleValue = { data: 'stale' };
      const error = new Error('Fetch failed');
      const fetcher = jest.fn().mockRejectedValue(error);

      // Set stale data
      await apiCache.set(key, staleValue);

      // Mock getStale to return our stale value
      jest.spyOn(apiCache, 'getStale').mockResolvedValue(staleValue);

      // Clear the cache to force a fetch
      await apiCache.delete(key);

      // Should return stale data on error
      const result = await apiCache.dedupeRequest(key, fetcher);

      expect(result).toEqual(staleValue);
    });

    it('should throw error when no stale data available', async () => {
      const key = 'error-no-stale';
      const error = new Error('Fetch failed');
      const fetcher = jest.fn().mockRejectedValue(error);

      // Mock getStale to return undefined
      jest.spyOn(apiCache, 'getStale').mockResolvedValue(undefined);

      // Should throw the error
      await expect(apiCache.dedupeRequest(key, fetcher)).rejects.toThrow(
        'Fetch failed'
      );
    });

    it('should cache successful fetch with TTL', async () => {
      const key = 'ttl-dedupe';
      const value = { data: 'ttl' };
      const ttl = 10000;
      const fetcher = jest.fn().mockResolvedValue(value);

      await apiCache.dedupeRequest(key, fetcher, ttl);

      // Value should be cached
      expect(await apiCache.get(key)).toEqual(value);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with multiple items', async () => {
      const items = [
        {
          key: 'warm1',
          fetcher: jest.fn().mockResolvedValue({ data: 'warm1' }),
          ttl: 5000,
        },
        {
          key: 'warm2',
          fetcher: jest.fn().mockResolvedValue({ data: 'warm2' }),
        },
        {
          key: 'warm3',
          fetcher: jest.fn().mockResolvedValue({ data: 'warm3' }),
          ttl: 10000,
        },
      ];

      await apiCache.warmCache(items);

      // All items should be cached
      expect(await apiCache.get('warm1')).toEqual({ data: 'warm1' });
      expect(await apiCache.get('warm2')).toEqual({ data: 'warm2' });
      expect(await apiCache.get('warm3')).toEqual({ data: 'warm3' });

      // All fetchers should be called
      items.forEach(item => {
        expect(item.fetcher).toHaveBeenCalledTimes(1);
      });
    });

    it('should skip warming if item already cached', async () => {
      const key = 'already-cached';
      const existingValue = { data: 'existing' };
      const fetcher = jest.fn().mockResolvedValue({ data: 'new' });

      // Pre-populate cache
      await apiCache.set(key, existingValue);

      await apiCache.warmCache([{ key, fetcher }]);

      // Should not call fetcher
      expect(fetcher).not.toHaveBeenCalled();

      // Should keep existing value
      expect(await apiCache.get(key)).toEqual(existingValue);
    });

    it('should handle errors during cache warming', async () => {
      const items = [
        {
          key: 'success-warm',
          fetcher: jest.fn().mockResolvedValue({ data: 'success' }),
        },
        {
          key: 'error-warm',
          fetcher: jest.fn().mockRejectedValue(new Error('Warm failed')),
        },
      ];

      await apiCache.warmCache(items);

      // Successful item should be cached
      expect(await apiCache.get('success-warm')).toEqual({ data: 'success' });

      // Error item should not be cached
      expect(await apiCache.get('error-warm')).toBeUndefined();
    });
  });

  describe('Utility Functions', () => {
    it('should generate cache keys correctly', () => {
      const key1 = getCacheKey('coins', { page: 1, per_page: 20 });
      expect(key1).toBe('coins:page:1-per_page:20');

      const key2 = getCacheKey('coin-detail', { coinId: 'bitcoin' });
      expect(key2).toBe('coin-detail:coinId:bitcoin');

      const key3 = getCacheKey('price-history', {
        coinId: 'ethereum',
        days: 7,
      });
      expect(key3).toBe('price-history:coinId:ethereum-days:7');

      const key4 = getCacheKey('search', { query: 'btc' });
      expect(key4).toBe('search:query:btc');
    });

    it('should sort cache key parameters', () => {
      const key1 = getCacheKey('coins', { per_page: 20, page: 1 });
      const key2 = getCacheKey('coins', { page: 1, per_page: 20 });

      expect(key1).toBe(key2);
    });

    it('should get container age', () => {
      const age = getContainerAge();

      // Should return a string in format "Xm Ys"
      expect(age).toMatch(/^\d+m \d+s$/);
    });

    it('should handle missing container start time', () => {
      // Mock undefined start times
      const originalGlobalThis = globalThis._cacheStartTime;
      globalThis._cacheStartTime = undefined;

      // Clear module cache to reset cacheStartTime
      jest.resetModules();

      // Should return default
      const age = getContainerAge();
      expect(age).toBe('0m 0s');

      // Restore
      globalThis._cacheStartTime = originalGlobalThis;
    });
  });

  describe('Cache TTL Constants', () => {
    it('should have correct TTL values', () => {
      expect(CACHE_TTL.COINS_LIST).toBe(2 * 60 * 1000); // 2 minutes
      expect(CACHE_TTL.COIN_DETAIL).toBe(5 * 60 * 1000); // 5 minutes
      expect(CACHE_TTL.PRICE_HISTORY).toBe(15 * 60 * 1000); // 15 minutes
      expect(CACHE_TTL.SEARCH).toBe(10 * 60 * 1000); // 10 minutes
    });
  });

  describe('Size Calculation', () => {
    it('should handle JSON serialization errors gracefully', async () => {
      // Create a circular reference that will fail JSON.stringify
      const circular: any = { data: 'test' };
      circular.self = circular;

      // This should not throw
      await expect(
        apiCache.set('circular-key', circular)
      ).resolves.not.toThrow();
    });
  });

  describe('Cache Behavior Verification', () => {
    it('should track cache hits and misses in stats', async () => {
      const key = 'stats-test';

      // Clear stats first
      await apiCache.clear();

      // Miss - should increment miss counter
      await apiCache.get(key);
      let stats = apiCache.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);

      // Set the value
      await apiCache.set(key, 'value');

      // Hit - should increment hit counter
      await apiCache.get(key);
      stats = apiCache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });

    it.skip('should deduplicate concurrent requests', async () => {
      const key = 'dedupe-test-2';
      const value = 'test-value';
      let fetchCount = 0;
      const fetcher = jest.fn().mockImplementation(() => {
        fetchCount++;
        return Promise.resolve(value);
      });

      // Clear cache to ensure fresh state
      await apiCache.clear();

      // Make concurrent requests
      const [result1, result2] = await Promise.all([
        apiCache.dedupeRequest(key, fetcher),
        apiCache.dedupeRequest(key, fetcher),
      ]);

      // Fetcher should only be called once
      expect(fetchCount).toBe(1);
      expect(result1).toBe(value);
      expect(result2).toBe(value);
    });
  });

  describe('KV Integration', () => {
    it('should get KV stats', async () => {
      const kvStats = await apiCache.getKvStats();
      expect(kvStats).toHaveProperty('dbSize');
      expect(kvStats).toHaveProperty('available');
      expect(kvStats.available).toBe(false); // Mocked KV not available
    });

    it('should handle KV availability check', async () => {
      const stats = apiCache.getStats();
      expect(stats.kvAvailable).toBeDefined();
    });

    it('should fallback to LRU when KV is not available', async () => {
      const key = 'fallback-test';
      const value = { data: 'fallback' };

      await apiCache.set(key, value);
      const retrieved = await apiCache.get(key);

      expect(retrieved).toEqual(value);
      const stats = apiCache.getStats();
      expect(stats.kvAvailable).toBe(false);
    });

    it('should handle KV errors gracefully', async () => {
      const { kv } = require('@vercel/kv');
      kv.get.mockRejectedValueOnce(new Error('KV error'));

      const key = 'kv-error-test';
      const value = { data: 'error-test' };

      // Should still work with LRU even if KV fails
      await apiCache.set(key, value);
      const retrieved = await apiCache.get(key);

      expect(retrieved).toEqual(value);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle undefined values', async () => {
      const key = 'undefined-test';
      await apiCache.set(key, undefined);
      const value = await apiCache.get(key);
      expect(value).toBeUndefined();
    });

    it('should handle null values', async () => {
      const key = 'null-test';
      await apiCache.set(key, null);
      const value = await apiCache.get(key);
      expect(value).toBeNull();
    });

    it('should handle large objects', async () => {
      const key = 'large-test';
      const largeArray = new Array(1000).fill({
        data: 'test',
        id: Math.random(),
      });

      await apiCache.set(key, largeArray);
      const retrieved = await apiCache.get(key);

      expect(retrieved).toEqual(largeArray);
      expect(retrieved).toHaveLength(1000);
    });

    it('should handle special characters in keys', async () => {
      const key = 'test:with:colons:and-dashes_underscores';
      const value = { data: 'special' };

      await apiCache.set(key, value);
      const retrieved = await apiCache.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should handle concurrent operations', async () => {
      const operations = [];

      // Perform multiple concurrent operations
      for (let i = 0; i < 10; i++) {
        operations.push(apiCache.set(`concurrent-${i}`, { data: i }));
      }

      await Promise.all(operations);

      // Verify all values are set correctly
      for (let i = 0; i < 10; i++) {
        const value = await apiCache.get(`concurrent-${i}`);
        expect(value).toEqual({ data: i });
      }
    });
  });
});
