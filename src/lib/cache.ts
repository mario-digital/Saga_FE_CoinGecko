/**
 * LRU Cache service for API responses
 */

import { LRUCache } from 'lru-cache';

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
}

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
    };

    // Track pending requests to prevent duplicate API calls
    this.pendingRequests = new Map();
  }

  /**
   * Get item from cache
   */
  get<T = any>(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    return value;
  }

  /**
   * Get stale item from cache (for fallback on errors)
   */
  getStale<T = any>(key: string): T | undefined {
    // peek doesn't update recency or delete expired items
    return this.cache.peek(key);
  }

  /**
   * Set item in cache with optional TTL
   */
  set<T = any>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, { ttl });
    this.updateStats();
  }

  /**
   * Check if key exists in cache (including stale)
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.updateStats();
    return result;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    // Reset stats
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.updateStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number; hitRatePercentage: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    return {
      ...this.stats,
      hitRate,
      hitRatePercentage: `${(hitRate * 100).toFixed(2)}%`,
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

    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Create new request and track it
    const request = fetcher()
      .then(data => {
        this.set(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        // Try to return stale data on error
        const stale = this.getStale<T>(key);
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
        if (!this.has(key)) {
          const data = await fetcher();
          this.set(key, data, ttl);
        }
      } catch (error) {}
    });

    await Promise.allSettled(promises);
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
