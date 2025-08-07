/**
 * Mock for cache service in tests
 */

export const CACHE_TTL = {
  COINS_LIST: 2 * 60 * 1000,
  COIN_DETAIL: 5 * 60 * 1000,
  PRICE_HISTORY: 15 * 60 * 1000,
  SEARCH: 10 * 60 * 1000,
};

class MockApiCache {
  private cache = new Map<string, any>();
  private ttls = new Map<string, number>();
  private stats = {
    hits: 0,
    misses: 0,
    size: 0,
    itemCount: 0,
  };

  get<T = any>(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    return value;
  }

  getStale<T = any>(key: string): T | undefined {
    return this.cache.get(key);
  }

  set<T = any>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value);
    if (ttl !== undefined) {
      this.ttls.set(key, Date.now() + ttl);
    } else {
      this.ttls.set(key, Date.now() + 60000); // Default 60s
    }
    this.stats.itemCount = this.cache.size;
    // Update size calculation
    this.stats.size = Array.from(this.cache.values()).reduce(
      (total, val) => total + JSON.stringify(val).length,
      0
    );
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.ttls.delete(key);
    this.stats.itemCount = this.cache.size;
    // Update size calculation
    this.stats.size = Array.from(this.cache.values()).reduce(
      (total, val) => total + JSON.stringify(val).length,
      0
    );
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.ttls.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      itemCount: 0,
    };
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      hitRatePercentage:
        total > 0
          ? `${((this.stats.hits / total) * 100).toFixed(2)}%`
          : '0.00%',
    };
  }

  getCacheItems() {
    const items: Array<{ key: string; size: number; remainingTTL: string }> =
      [];
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      const expiry = this.ttls.get(key) || now + 60000;
      const remaining = expiry - now;
      items.push({
        key,
        size: JSON.stringify(value).length,
        remainingTTL:
          remaining > 0 ? `${Math.round(remaining / 1000)}s` : 'Expired',
      });
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }

  async dedupeRequest<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const data = await fetcher();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // Try to return stale data on error
      const stale = this.getStale<T>(key);
      if (stale !== undefined) {
        return stale;
      }
      throw error;
    }
  }

  async warmCache(
    _items: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>
  ): Promise<void> {
    // Mock implementation
  }
}

export const apiCache = new MockApiCache();

export function getContainerAge(): string {
  return '0m 0s';
}

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
