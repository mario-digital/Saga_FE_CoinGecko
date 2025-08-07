/**
 * Mock for rate limiter in tests
 */

class MockRateLimiter {
  private requestCount = 0;
  private windowStart = Date.now();

  async execute<T>(
    fn: () => Promise<T>,
    _options?: {
      priority?: number;
      signal?: AbortSignal;
      skipRetry?: boolean;
    }
  ): Promise<T> {
    this.requestCount++;
    return fn();
  }

  getQueueSize(): number {
    return 0;
  }

  getActiveCount(): number {
    return 0;
  }

  isBusy(): boolean {
    return false;
  }

  clearQueue(): void {
    // Mock implementation
  }

  getStats() {
    return {
      requestsInWindow: this.requestCount,
      windowStart: this.windowStart,
      queueSize: 0,
      activeRequests: 0,
      isBusy: false,
    };
  }
}

export const rateLimiter = new MockRateLimiter();

export async function rateLimitedFetch(
  url: string,
  options?: RequestInit & { skipRetry?: boolean }
): Promise<Response> {
  // In tests, just use regular fetch without rate limiting
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error: any = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  } catch (error: any) {
    // Re-throw the error so tests can handle it properly
    if (error.status) {
      throw error;
    }
    // Network errors don't have a status
    const networkError: any = new Error(error.message || 'Network error');
    networkError.status = undefined;
    throw networkError;
  }
}
