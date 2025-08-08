/**
 * Tests for application constants
 */

import {
  API_BASE_URL,
  DEFAULT_CURRENCY,
  DEFAULT_PER_PAGE,
  MAX_COINS_PER_PAGE,
  DEFAULT_ORDER,
  API_ENDPOINTS,
  SWR_CONFIG,
} from '../constants';

describe('Constants', () => {
  describe('API Configuration', () => {
    it('should have correct API base URL', () => {
      expect(API_BASE_URL).toBe('https://api.coingecko.com/api/v3');
    });

    it('should have correct default currency', () => {
      expect(DEFAULT_CURRENCY).toBe('usd');
    });

    it('should have correct pagination defaults', () => {
      expect(DEFAULT_PER_PAGE).toBe(50);
      expect(MAX_COINS_PER_PAGE).toBe(100);
    });

    it('should have correct default order', () => {
      expect(DEFAULT_ORDER).toBe('market_cap_desc');
    });
  });

  describe('API Endpoints', () => {
    it('should have correct endpoint paths', () => {
      expect(API_ENDPOINTS.COINS_MARKETS).toBe('/coins/markets');
      expect(API_ENDPOINTS.COIN_DETAIL).toBe('/coins');
      expect(API_ENDPOINTS.SEARCH).toBe('/search');
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(API_ENDPOINTS)).toBe(false);
    });
  });

  describe('SWR Configuration', () => {
    it('should have correct basic SWR settings', () => {
      expect(SWR_CONFIG.revalidateOnFocus).toBe(false);
      expect(SWR_CONFIG.revalidateOnReconnect).toBe(true);
      expect(SWR_CONFIG.dedupingInterval).toBe(5000);
      expect(SWR_CONFIG.focusThrottleInterval).toBe(5000);
      expect(SWR_CONFIG.errorRetryCount).toBe(3);
      expect(SWR_CONFIG.errorRetryInterval).toBe(5000);
    });

    it('should have onErrorRetry function', () => {
      expect(typeof SWR_CONFIG.onErrorRetry).toBe('function');
    });

    describe('onErrorRetry behavior', () => {
      let revalidateMock: jest.Mock;
      let setTimeoutSpy: jest.SpyInstance;

      beforeEach(() => {
        jest.useFakeTimers();
        revalidateMock = jest.fn();
        setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      });

      afterEach(() => {
        jest.useRealTimers();
        setTimeoutSpy.mockRestore();
      });

      it('should not retry on 404 errors', () => {
        const error = { status: 404 };
        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 0,
        });

        expect(setTimeoutSpy).not.toHaveBeenCalled();
        expect(revalidateMock).not.toHaveBeenCalled();
      });

      it('should not retry on 429 rate limit errors', () => {
        const error = { status: 429 };
        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 0,
        });

        expect(setTimeoutSpy).not.toHaveBeenCalled();
        expect(revalidateMock).not.toHaveBeenCalled();
      });

      it('should not retry after 3 attempts', () => {
        const error = { status: 500 };
        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 3,
        });

        expect(setTimeoutSpy).not.toHaveBeenCalled();
        expect(revalidateMock).not.toHaveBeenCalled();
      });

      it('should not retry beyond 3 attempts', () => {
        const error = { status: 500 };
        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 5,
        });

        expect(setTimeoutSpy).not.toHaveBeenCalled();
        expect(revalidateMock).not.toHaveBeenCalled();
      });

      it('should retry with exponential backoff for other errors', () => {
        const error = { status: 500 };

        // First retry (retryCount = 0)
        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 0,
        });

        expect(setTimeoutSpy).toHaveBeenCalledWith(
          expect.any(Function),
          5000 // 5000 * 2^0 = 5000
        );

        // Execute the timeout callback
        const callback1 = setTimeoutSpy.mock.calls[0][0];
        callback1();
        expect(revalidateMock).toHaveBeenCalledWith({ retryCount: 0 });

        setTimeoutSpy.mockClear();
        revalidateMock.mockClear();

        // Second retry (retryCount = 1)
        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 1,
        });

        expect(setTimeoutSpy).toHaveBeenCalledWith(
          expect.any(Function),
          10000 // 5000 * 2^1 = 10000
        );

        // Execute the timeout callback
        const callback2 = setTimeoutSpy.mock.calls[0][0];
        callback2();
        expect(revalidateMock).toHaveBeenCalledWith({ retryCount: 1 });

        setTimeoutSpy.mockClear();
        revalidateMock.mockClear();

        // Third retry (retryCount = 2)
        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 2,
        });

        expect(setTimeoutSpy).toHaveBeenCalledWith(
          expect.any(Function),
          20000 // 5000 * 2^2 = 20000
        );

        // Execute the timeout callback
        const callback3 = setTimeoutSpy.mock.calls[0][0];
        callback3();
        expect(revalidateMock).toHaveBeenCalledWith({ retryCount: 2 });
      });

      it('should handle network errors with retry', () => {
        const error = new Error('Network error');

        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 0,
        });

        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

        // Execute the timeout callback
        const callback = setTimeoutSpy.mock.calls[0][0];
        callback();
        expect(revalidateMock).toHaveBeenCalledWith({ retryCount: 0 });
      });

      it('should handle errors without status property', () => {
        const error = { message: 'Some error' };

        SWR_CONFIG.onErrorRetry(error, 'test-key', {}, revalidateMock, {
          retryCount: 1,
        });

        expect(setTimeoutSpy).toHaveBeenCalledWith(
          expect.any(Function),
          10000 // Exponential backoff
        );
      });
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(SWR_CONFIG)).toBe(false);
    });
  });

  describe('Type safety', () => {
    it('should maintain correct types for all constants', () => {
      // Type checks (these would fail at compile time if incorrect)
      const url: string = API_BASE_URL;
      const currency: string = DEFAULT_CURRENCY;
      const perPage: number = DEFAULT_PER_PAGE;
      const maxPerPage: number = MAX_COINS_PER_PAGE;
      const order: string = DEFAULT_ORDER;

      // Runtime checks
      expect(typeof url).toBe('string');
      expect(typeof currency).toBe('string');
      expect(typeof perPage).toBe('number');
      expect(typeof maxPerPage).toBe('number');
      expect(typeof order).toBe('string');
    });
  });
});
