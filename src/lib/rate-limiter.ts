/**
 * Rate limiter for API requests to prevent hitting CoinGecko limits
 */

import pLimit from 'p-limit';
import pRetry from 'p-retry';

/**
 * Custom error class for rate limit errors
 */
export class RateLimitError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number = 429, retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

// CoinGecko API limits (Free tier)
// - 10-30 calls/minute depending on endpoint
// - We'll be conservative with 10 req/sec max
const RATE_LIMIT = 10; // Max concurrent requests
const RETRY_OPTIONS = {
  retries: 3,
  minTimeout: 1000, // 1 second
  maxTimeout: 30000, // 30 seconds
  factor: 2, // Exponential backoff factor
  onFailedAttempt: () => {
    // Silent retry
  },
};

class RateLimiter {
  private limiter: ReturnType<typeof pLimit>;
  private requestCount: number = 0;
  private windowStart: number = Date.now();
  private readonly windowMs = 60000; // 1 minute window

  constructor() {
    this.limiter = pLimit(RATE_LIMIT);
  }

  /**
   * Execute a function with rate limiting and retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    options?: {
      priority?: number;
      signal?: AbortSignal;
      skipRetry?: boolean;
    }
  ): Promise<T> {
    // Update request count for monitoring
    this.updateRequestCount();

    // Wrap function with retry logic unless skipped
    const wrappedFn = options?.skipRetry
      ? fn
      : () =>
          pRetry(fn, {
            ...RETRY_OPTIONS,
            ...(options?.signal && { signal: options.signal }),
            shouldRetry: (error: any) => {
              // Don't retry if error has skipRetry flag
              if (error.skipRetry) return false;
              // Don't retry on RateLimitError
              if (error instanceof RateLimitError) return false;
              // Don't retry on 404 (not found)
              if (error.status === 404) return false;
              // Don't retry on 400 (bad request)
              if (error.status === 400) return false;
              // Don't retry on 429 (rate limit)
              if (error.status === 429) return false;
              // Retry on server errors
              if (error.status >= 500) return true;
              // Retry on network errors (no status code)
              if (!error.status) return true;
              // Don't retry on other client errors
              return false;
            },
          });

    // Execute with rate limiting
    return this.limiter(wrappedFn);
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.limiter.pendingCount;
  }

  /**
   * Get active request count
   */
  getActiveCount(): number {
    return this.limiter.activeCount;
  }

  /**
   * Check if rate limiter is busy
   */
  isBusy(): boolean {
    return this.limiter.activeCount >= RATE_LIMIT;
  }

  /**
   * Clear all pending requests
   */
  clearQueue(): void {
    this.limiter.clearQueue();
  }

  /**
   * Get rate limit statistics
   */
  getStats() {
    const now = Date.now();
    const windowAge = now - this.windowStart;

    // Reset window if it's been more than a minute
    if (windowAge > this.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    const activeRequests = this.getActiveCount();
    const status = activeRequests >= RATE_LIMIT ? 'BUSY' : 'READY';

    return {
      requestsInWindow: this.requestCount,
      windowStart: new Date(this.windowStart).toISOString(),
      queueSize: this.getQueueSize(),
      activeRequests,
      maxConcurrent: RATE_LIMIT,
      status,
      isBusy: this.isBusy(),
    };
  }

  /**
   * Update request count for monitoring
   */
  private updateRequestCount(): void {
    const now = Date.now();
    const windowAge = now - this.windowStart;

    if (windowAge > this.windowMs) {
      // Start new window
      this.requestCount = 1;
      this.windowStart = now;
    } else {
      this.requestCount++;
    }

    // Log warning if approaching limits
    // Silent check
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Helper function to create a rate-limited fetch
 */
export async function rateLimitedFetch(
  url: string,
  options?: RequestInit & { skipRetry?: boolean }
): Promise<Response> {
  return rateLimiter.execute(
    async () => {
      const response = await fetch(url, options);

      // Throw error for non-ok responses
      if (!response.ok) {
        // Handle rate limit errors specially - don't retry
        if (response.status === 429) {
          throw new RateLimitError(
            `HTTP 429: ${response.statusText || 'Too Many Requests'}`,
            429
          );
        }

        // For 404, don't retry
        if (response.status === 404) {
          const error: any = new Error(
            `HTTP error! status: ${response.status}`
          );
          error.status = response.status;
          error.response = response;
          (error as any).skipRetry = true;
          throw error;
        }

        // Other errors - will retry
        const error: any = new Error(
          `HTTP ${response.status}: ${response.statusText || 'Unknown Error'}`
        );
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return response;
    },
    {
      skipRetry: options?.skipRetry,
      ...(options?.signal && { signal: options.signal }),
    }
  );
}
