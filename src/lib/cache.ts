/**
 * Two-tier cache service: Vercel KV (persistent) + LRU (in-memory)
 */

import { LRUCache } from 'lru-cache';
import { kv } from '@vercel/kv';

// Cache configuration
const CACHE_SIZE = 500; // Max 500 items
const CACHE_MAX_SIZE = 100 * 1024 * 1024; // 100MB max memory
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

// Different TTLs for different data types
export const CACHE_TTL = {
  COINS_LIST: 2 * 60 * 1000, // 2 minutes for coin lists (changes frequently)
  COIN_DETAIL: 5 * 60 * 1000, // 5 minutes for coin details
  PRICE_HISTORY: 15 * 60 * 1000, // 15 minutes for price history (less volatile)
  SEARCH: 10 * 60 * 1000, // 10 minutes for search results
} as const;

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  itemCount: number;
  lruHits: number;
  kvHits: number;
  kvMisses: number;
}

// KV availability flag
let kvAvailable = false;
let kvChecked = false;

class ApiCache {
  private cache: LRUCache<string, any>;
  private stats: CacheStats;
  private pendingRequests: Map<string, Promise<any>>;

  constructor() {
    this.cache = new LRUCache({
      max: CACHE_SIZE,
      maxSize: CACHE_MAX_SIZE,
      ttl: DEFAULT_TTL,
      sizeCalculation: value => {
        try {
          return JSON.stringify(value).length;
        } catch {
          return 1000; // Default size if serialization fails
        }
      },
      updateAgeOnGet: true, // Update age on access (true LRU)
      updateAgeOnHas: false,
      allowStale: true, // Allow stale data to be returned while fetching
      noDeleteOnStaleGet: true, // Keep stale data for fallback
    });

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      itemCount: 0,
      lruHits: 0,
      kvHits: 0,
      kvMisses: 0,
    };

    // Track pending requests to prevent duplicate API calls
    this.pendingRequests = new Map();

    // Don't check KV on construction - will check on first use
  }

  /**
   * Check if Vercel KV is available
   */
  private async checkKvAvailability(): Promise<boolean> {
    if (kvChecked) return kvAvailable;

    try {
      // Map Vercel's KV_KV_ prefixed variables to what @vercel/kv expects
      if (!process.env.KV_REST_API_URL && process.env.KV_KV_REST_API_URL) {
        process.env.KV_REST_API_URL = process.env.KV_KV_REST_API_URL;
      }
      if (!process.env.KV_REST_API_TOKEN && process.env.KV_KV_REST_API_TOKEN) {
        process.env.KV_REST_API_TOKEN = process.env.KV_KV_REST_API_TOKEN;
      }
      if (
        !process.env.KV_REST_API_READ_ONLY_TOKEN &&
        process.env.KV_KV_REST_API_READ_ONLY_TOKEN
      ) {
        process.env.KV_REST_API_READ_ONLY_TOKEN =
          process.env.KV_KV_REST_API_READ_ONLY_TOKEN;
      }
      if (!process.env.KV_URL && process.env.KV_KV_URL) {
        process.env.KV_URL = process.env.KV_KV_URL;
      }

      // Check if KV credentials are configured
      const hasCredentials =
        process.env.KV_REST_API_URL || process.env.KV_REST_API_TOKEN;

      if (!hasCredentials) {
        kvAvailable = false;
      } else {
        // Test KV connection with a simple ping
        await kv.ping();
        kvAvailable = true;
      }
    } catch (error: any) {
      kvAvailable = false;
    }

    kvChecked = true;
    return kvAvailable;
  }

  /**
   * Get item from cache (two-tier: LRU → KV)
   */
  async get<T = any>(key: string): Promise<T | undefined> {
    // Ensure KV is checked on first use
    if (!kvChecked) {
      await this.checkKvAvailability();
    }

    // First, check LRU cache (fastest)
    const lruValue = this.cache.get(key);
    if (lruValue !== undefined) {
      this.stats.hits++;
      this.stats.lruHits++;
      return lruValue;
    }

    // Then check KV if available (persistent)
    if (kvAvailable) {
      try {
        const kvValue = await kv.get<T>(key);
        if (kvValue !== null) {
          this.stats.hits++;
          this.stats.kvHits++;
          // Populate LRU cache for faster subsequent access
          this.cache.set(key, kvValue);
          return kvValue;
        }
        this.stats.kvMisses++;
      } catch (error) {
        // Continue without KV
      }
    }

    this.stats.misses++;
    return undefined;
  }

  /**
   * Get stale item from cache (for fallback on errors)
   */
  async getStale<T = any>(key: string): Promise<T | undefined> {
    // First check LRU for stale data
    const lruStale = this.cache.peek(key);
    if (lruStale !== undefined) {
      return lruStale;
    }

    // Then check KV if available
    if (kvAvailable) {
      try {
        const kvValue = await kv.get<T>(key);
        if (kvValue !== null) {
          return kvValue;
        }
      } catch (error) {
        // Silently fail for stale data retrieval
      }
    }

    return undefined;
  }

  /**
   * Set item in cache with optional TTL (writes to both LRU and KV)
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    // Ensure KV is checked on first use
    if (!kvChecked) {
      await this.checkKvAvailability();
    }
    // Always set in LRU cache
    this.cache.set(key, value, { ttl });
    this.updateStats();

    // Also set in KV if available
    if (kvAvailable) {
      try {
        // KV uses seconds for TTL, we use milliseconds
        const kvTtl = ttl
          ? Math.ceil(ttl / 1000)
          : Math.ceil(DEFAULT_TTL / 1000);
        await kv.set(key, value, { ex: kvTtl });
      } catch (error) {
        // Continue without KV - LRU cache still works
      }
    }
  }

  /**
   * Check if key exists in cache (including stale)
   */
  async has(key: string): Promise<boolean> {
    // Ensure KV is checked on first use
    if (!kvChecked) {
      await this.checkKvAvailability();
    }
    // Check LRU first
    if (this.cache.has(key)) {
      return true;
    }

    // Check KV if available
    if (kvAvailable) {
      try {
        const exists = await kv.exists(key);
        return exists === 1;
      } catch (error) {
        // Silently fail
      }
    }

    return false;
  }

  /**
   * Delete item from cache (both LRU and KV)
   */
  async delete(key: string): Promise<boolean> {
    const lruResult = this.cache.delete(key);
    this.updateStats();

    // Also delete from KV if available
    if (kvAvailable) {
      try {
        await kv.del(key);
      } catch (error) {
        // Silently fail - KV delete error
      }
    }

    return lruResult;
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.pendingRequests.clear();

    // Note: We don't clear KV in production to preserve cache across deploys
    // Only clear KV in development if explicitly needed
    if (kvAvailable && process.env.NODE_ENV === 'development') {
      try {
        // Get all keys and delete them
        const keys = await kv.keys('*');
        if (keys.length > 0) {
          await kv.del(...keys);
        }
      } catch (error) {
        // Silently fail - KV clear error
      }
    }

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      itemCount: 0,
      lruHits: 0,
      kvHits: 0,
      kvMisses: 0,
    };
    this.updateStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & {
    hitRate: number;
    hitRatePercentage: string;
    lruHitRate: string;
    kvHitRate: string;
    kvAvailable: boolean;
  } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    // Calculate hit rates: what percentage of ALL requests were served from each cache layer
    const lruHitRate =
      total > 0 ? ((this.stats.lruHits / total) * 100).toFixed(1) : '0';
    const kvHitRate =
      total > 0 ? ((this.stats.kvHits / total) * 100).toFixed(1) : '0';

    return {
      ...this.stats,
      hitRate,
      hitRatePercentage: `${(hitRate * 100).toFixed(2)}%`,
      lruHitRate: `${lruHitRate}%`,
      kvHitRate: `${kvHitRate}%`,
      kvAvailable,
    };
  }

  /**
   * Get list of cached items with their metadata
   */
  getCacheItems(): Array<{ key: string; size: number; remainingTTL: string }> {
    const items: Array<{ key: string; size: number; remainingTTL: string }> =
      [];

    // Iterate through cache entries
    for (const [key, entry] of this.cache.entries()) {
      const ttl = this.cache.getRemainingTTL(key);

      items.push({
        key,
        size: JSON.stringify(entry).length,
        remainingTTL: ttl > 0 ? `${Math.round(ttl / 1000)}s` : 'Expired',
      });
    }

    return items.sort((a, b) => a.key.localeCompare(b.key));
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.calculatedSize;
    this.stats.itemCount = this.cache.size;
  }

  /**
   * Deduplicate concurrent requests for the same key
   */
  async dedupeRequest<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Check cache first (now async)
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Create new request and track it
    const request = fetcher()
      .then(async data => {
        await this.set(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(async error => {
        this.pendingRequests.delete(key);
        // Try to return stale data on error
        const stale = await this.getStale<T>(key);
        if (stale !== undefined) {
          return stale;
        }
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Warm the cache with popular items
   */
  async warmCache(
    items: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>
  ): Promise<void> {
    const promises = items.map(async ({ key, fetcher, ttl }) => {
      try {
        const exists = await this.has(key);
        if (!exists) {
          const data = await fetcher();
          await this.set(key, data, ttl);
        }
      } catch (error) {
        // Silently fail for cache warming
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get KV-specific statistics
   */
  async getKvStats(): Promise<{
    dbSize: number;
    available: boolean;
  }> {
    // Check KV availability if not checked yet
    if (!kvChecked) {
      await this.checkKvAvailability();
    }

    if (!kvAvailable) {
      return { dbSize: 0, available: false };
    }

    try {
      const dbSize = await kv.dbsize();
      return { dbSize, available: true };
    } catch (error) {
      return { dbSize: 0, available: false };
    }
  }
}

// Create a global cache instance that persists across requests in the same container
// Vercel keeps containers warm for a while, allowing cache to persist between requests

// Module-level cache instance - persists for the lifetime of the Node.js process
let cacheInstance: ApiCache | undefined;
let cacheStartTime: number | undefined;

// Initialize cache instance
if (!cacheInstance) {
  cacheInstance = new ApiCache();
  cacheStartTime = Date.now();

  // Also store in globalThis as backup for better persistence
  if (typeof globalThis !== 'undefined') {
    globalThis._apiCache = cacheInstance;
    globalThis._cacheStartTime = cacheStartTime;
  }
} else {
}

// Export singleton instance that persists in serverless environment
export const apiCache = cacheInstance;

// Export function to get container age
export function getContainerAge(): string {
  const startTime =
    cacheStartTime ||
    (typeof globalThis !== 'undefined'
      ? globalThis._cacheStartTime
      : undefined);
  if (startTime) {
    const ageMs = Date.now() - startTime;
    const ageMinutes = Math.floor(ageMs / 60000);
    const ageSeconds = Math.floor((ageMs % 60000) / 1000);
    return `${ageMinutes}m ${ageSeconds}s`;
  }
  return '0m 0s';
}

// Helper function to generate cache keys
export function getCacheKey(
  type: 'coins' | 'coin-detail' | 'price-history' | 'search',
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('-');
  return `${type}:${sortedParams}`;
}
