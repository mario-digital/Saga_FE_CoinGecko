/**
 * Tests for rate-limiter.ts
 */

// We need to test the real rate-limiter implementation, not the mock
// The jest.setup.js mocks @/lib/rate-limiter for other tests, but we need the real one here
jest.unmock('@/lib/rate-limiter');

import { rateLimiter, rateLimitedFetch, RateLimitError } from '../rate-limiter';
import pLimit from 'p-limit';
import pRetry from 'p-retry';

// Mock p-limit
jest.mock('p-limit', () => {
  return jest.fn(() => {
    const queue: Function[] = [];
    let running = 0;
    const maxConcurrent = 10;

    const limiter = jest.fn((fn: Function) => {
      return new Promise((resolve, reject) => {
        const run = async () => {
          if (running >= maxConcurrent) {
            queue.push(run);
            return;
          }

          running++;
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            running--;
            if (queue.length > 0) {
              const next = queue.shift();
              next?.();
            }
          }
        };

        run();
      });
    });

    // Add properties for testing
    (limiter as any).activeCount = running;
    (limiter as any).pendingCount = queue.length;

    return limiter;
  });
});

// Mock p-retry
jest.mock('p-retry', () => {
  return jest.fn((fn: Function, options?: any) => {
    let attempt = 0;
    const maxRetries = options?.retries || 3;

    const tryFn = async (): Promise<any> => {
      attempt++;
      try {
        return await fn(attempt);
      } catch (error: any) {
        // Check if should retry
        if (options?.shouldRetry && !options.shouldRetry(error)) {
          throw error;
        }

        if (attempt >= maxRetries) {
          throw error;
        }

        if (options?.onFailedAttempt) {
          await options.onFailedAttempt({
            attemptNumber: attempt,
            retriesLeft: maxRetries - attempt,
            error,
          });
        }

        // Wait before retry (but much shorter for tests)
        const delay = 10; // Short delay for tests
        await new Promise(resolve => setTimeout(resolve, delay));

        return tryFn();
      }
    };

    return tryFn();
  });
});

// Mock fetch
global.fetch = jest.fn();

describe('Rate Limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with correct properties', () => {
      const error = new RateLimitError('Rate limit exceeded');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
      expect(error.status).toBe(429);
    });

    it('should have proper stack trace', () => {
      const error = new RateLimitError('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('rateLimitedFetch', () => {
    it('should make successful fetch request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await rateLimitedFetch('https://api.example.com/data');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        undefined
      );
      expect(result).toBe(mockResponse);
    });

    it('should pass options to fetch', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await rateLimitedFetch('https://api.example.com/data', options);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        options
      );
    });

    it('should throw error for non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        rateLimitedFetch('https://api.example.com/data')
      ).rejects.toThrow('HTTP error! status: 404');
    });

    it('should throw RateLimitError for 429 status', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        rateLimitedFetch('https://api.example.com/data')
      ).rejects.toThrow(RateLimitError);
    });

    it('should retry on failure', async () => {
      const mockError = new Error('Network error');
      const mockSuccess = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      const result = await rateLimitedFetch('https://api.example.com/data');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockSuccess);
    });

    it('should not retry on 429 status', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        rateLimitedFetch('https://api.example.com/data')
      ).rejects.toThrow(RateLimitError);

      // Should only call once (no retries for 429)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 404 status', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        rateLimitedFetch('https://api.example.com/data')
      ).rejects.toThrow();

      // Should only call once (no retries for 404)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch network errors', async () => {
      const networkError = new Error('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(
        rateLimitedFetch('https://api.example.com/data')
      ).rejects.toThrow('Failed to fetch');
    });

    it('should respect rate limiter concurrency', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve(mockResponse), 10))
      );

      // Make multiple concurrent requests
      const promises = Array(15)
        .fill(null)
        .map((_, i) => rateLimitedFetch(`https://api.example.com/data${i}`));

      // All should eventually resolve
      const results = await Promise.all(promises);
      expect(results).toHaveLength(15);
      expect(global.fetch).toHaveBeenCalledTimes(15);
    });

    it('should retry on server errors', async () => {
      const error500: any = new Error('Server error');
      error500.status = 500;
      const mockSuccess = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(error500)
        .mockResolvedValueOnce(mockSuccess);

      const result = await rateLimitedFetch('https://api.example.com/data');

      // Should have retried on 500 error
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockSuccess);
    });
  });

  describe('rateLimiter stats', () => {
    it('should get rate limiter statistics', () => {
      const stats = rateLimiter.getStats();

      expect(stats).toHaveProperty('activeRequests');
      expect(stats).toHaveProperty('queueSize');
      expect(stats).toHaveProperty('maxConcurrent');
      expect(stats).toHaveProperty('status');
      expect(stats).toHaveProperty('windowStart');

      expect(stats.maxConcurrent).toBe(10);
      expect(stats.status).toBe('READY');
    });

    it('should update stats based on active requests', () => {
      // Mock limiter with active requests
      const mockLimiter = pLimit(10) as any;
      mockLimiter.activeCount = 5;
      mockLimiter.pendingCount = 3;

      // Replace the limiter temporarily
      const originalLimiter = (rateLimiter as any).limiter;
      (rateLimiter as any).limiter = mockLimiter;

      const stats = rateLimiter.getStats();

      expect(stats.activeRequests).toBe(5);
      expect(stats.queueSize).toBe(3);

      // Restore
      (rateLimiter as any).limiter = originalLimiter;
    });

    it('should show READY status when under limit', () => {
      const mockLimiter = pLimit(10) as any;
      mockLimiter.activeCount = 5;
      mockLimiter.pendingCount = 0;

      const originalLimiter = (rateLimiter as any).limiter;
      (rateLimiter as any).limiter = mockLimiter;

      const stats = rateLimiter.getStats();
      expect(stats.status).toBe('READY');

      (rateLimiter as any).limiter = originalLimiter;
    });

    it('should show BUSY status when at limit', () => {
      const mockLimiter = pLimit(10) as any;
      mockLimiter.activeCount = 10;
      mockLimiter.pendingCount = 5;

      const originalLimiter = (rateLimiter as any).limiter;
      (rateLimiter as any).limiter = mockLimiter;

      const stats = rateLimiter.getStats();
      expect(stats.status).toBe('BUSY');

      (rateLimiter as any).limiter = originalLimiter;
    });

    it('should format window start time correctly', () => {
      const stats = rateLimiter.getStats();

      // Should be in ISO format
      expect(stats.windowStart).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle undefined response status', async () => {
      const mockResponse = {
        ok: false,
        status: undefined,
        statusText: 'Unknown Error',
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        rateLimitedFetch('https://api.example.com/data')
      ).rejects.toThrow('HTTP undefined: Unknown Error');
    });

    it.skip('should handle very long delays between retries', async () => {
      jest.useFakeTimers();

      const mockError = new Error('Temporary error');
      const mockSuccess = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      const promise = rateLimitedFetch('https://api.example.com/data');

      // Fast-forward through retries
      jest.runAllTimers();

      await promise;

      expect(global.fetch).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });

    it.skip('should exhaust all retries before failing', async () => {
      const mockError = new Error('Persistent error');
      (global.fetch as jest.Mock).mockRejectedValue(mockError);

      await expect(
        rateLimitedFetch('https://api.example.com/data')
      ).rejects.toThrow('Persistent error');

      // Should retry 3 times by default
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Console output', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it.skip('should log rate limit warning', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await rateLimitedFetch('https://api.example.com/data');
      } catch {
        // Expected to throw
      }

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Rate Limiter] Rate limit hit'),
        expect.any(String)
      );
    });

    it.skip('should log successful retry', async () => {
      const mockError = new Error('Temporary error');
      const mockSuccess = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      await rateLimitedFetch('https://api.example.com/data');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Rate Limiter] Request successful after retry')
      );
    });
  });
});
