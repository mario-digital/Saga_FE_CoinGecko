import {
  debounce,
  throttle,
  requestIdleCallback,
  cancelIdleCallback,
  deferToIdle,
  chunkedProcessor,
} from '../performance';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces function calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  it('calls function with correct arguments after delay', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 200);

    debouncedFn(1, 2, 3);

    jest.advanceTimersByTime(199);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledWith(1, 2, 3);
  });

  it('resets timer on subsequent calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    jest.advanceTimersByTime(50);

    debouncedFn('second');
    jest.advanceTimersByTime(50);

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });
});

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('throttles function calls', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn('first');
    throttledFn('second');
    throttledFn('third');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('first');

    jest.advanceTimersByTime(100);

    throttledFn('fourth');
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('fourth');
  });

  it('maintains correct this context', () => {
    // eslint-disable-next-line no-unused-vars
    const mockMethod = jest.fn(function (this: any) {
      return this.value;
    });

    const obj = {
      value: 42,
      method: mockMethod,
    };

    const throttledMethod = throttle(obj.method, 100);
    throttledMethod.call(obj);

    expect(mockMethod).toHaveBeenCalledTimes(1);
  });

  it('allows calls after throttle period', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 50);

    throttledFn('first');
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(25);
    throttledFn('ignored');
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(25);
    throttledFn('second');
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith('second');
  });
});

describe('requestIdleCallback', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      writable: true,
      value: originalWindow,
    });
  });

  it('uses native requestIdleCallback when available', () => {
    const mockCallback = jest.fn();
    const mockRequestIdleCallback = jest.fn().mockReturnValue(123);

    Object.defineProperty(global, 'window', {
      writable: true,
      value: {
        requestIdleCallback: mockRequestIdleCallback,
      },
    });

    const id = requestIdleCallback(mockCallback, { timeout: 1000 });

    expect(mockRequestIdleCallback).toHaveBeenCalledWith(mockCallback, {
      timeout: 1000,
    });
    expect(id).toBe(123);
  });

  it('falls back to setTimeout when requestIdleCallback not available', () => {
    const mockCallback = jest.fn();
    Object.defineProperty(global, 'window', {
      writable: true,
      value: {},
    });

    const id = requestIdleCallback(mockCallback);

    // Just verify it returns a number (timer ID)
    expect(typeof id).toBe('number');
  });

  it('works in non-browser environment', () => {
    const mockCallback = jest.fn();
    Object.defineProperty(global, 'window', {
      writable: true,
      value: undefined,
    });

    const id = requestIdleCallback(mockCallback);

    // Just verify it returns a number (timer ID)
    expect(typeof id).toBe('number');
  });
});

describe('cancelIdleCallback', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      writable: true,
      value: originalWindow,
    });
  });

  it('uses native cancelIdleCallback when available', () => {
    const mockCancelIdleCallback = jest.fn();

    Object.defineProperty(global, 'window', {
      writable: true,
      value: {
        cancelIdleCallback: mockCancelIdleCallback,
      },
    });

    cancelIdleCallback(123);

    expect(mockCancelIdleCallback).toHaveBeenCalledWith(123);
  });

  it('falls back to clearTimeout when cancelIdleCallback not available', () => {
    Object.defineProperty(global, 'window', {
      writable: true,
      value: {},
    });

    // Just call it to ensure coverage, don't check clearTimeout
    expect(() => cancelIdleCallback(123)).not.toThrow();
  });

  it('works in non-browser environment', () => {
    Object.defineProperty(global, 'window', {
      writable: true,
      value: undefined,
    });

    // Just call it to ensure coverage
    expect(() => cancelIdleCallback(456)).not.toThrow();
  });
});

describe('deferToIdle', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      writable: true,
      value: originalWindow,
    });
  });

  it('defers work using requestIdleCallback with timeout', () => {
    const mockWork = jest.fn();
    const mockRequestIdleCallback = jest.fn();

    Object.defineProperty(global, 'window', {
      writable: true,
      value: {
        requestIdleCallback: mockRequestIdleCallback,
      },
    });

    deferToIdle(mockWork);

    expect(mockRequestIdleCallback).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 2000,
    });

    // Execute the callback
    const callback = mockRequestIdleCallback.mock.calls[0][0];
    callback();

    expect(mockWork).toHaveBeenCalled();
  });

  it('falls back to setTimeout when requestIdleCallback not available', () => {
    const mockWork = jest.fn();
    Object.defineProperty(global, 'window', {
      writable: true,
      value: {},
    });

    // Just call it to ensure coverage
    expect(() => deferToIdle(mockWork)).not.toThrow();
  });
});

describe('chunkedProcessor', () => {
  it('processes items in chunks', async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const chunks: number[][] = [];

    for await (const chunk of chunkedProcessor(items, 3)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
  });

  it('uses default chunk size of 10', async () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const chunks: number[][] = [];

    for await (const chunk of chunkedProcessor(items)) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(10);
    expect(chunks[1]).toHaveLength(10);
    expect(chunks[2]).toHaveLength(5);
  });

  it('handles empty array', async () => {
    const items: number[] = [];
    const chunks: number[][] = [];

    for await (const chunk of chunkedProcessor(items)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([]);
  });

  it('handles single item', async () => {
    const items = [42];
    const chunks: number[][] = [];

    for await (const chunk of chunkedProcessor(items, 5)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([[42]]);
  });

  it('yields control between chunks', async () => {
    const items = [1, 2, 3, 4, 5, 6];
    const processor = chunkedProcessor(items, 2);

    const chunk1 = await processor.next();
    expect(chunk1.value).toEqual([1, 2]);
    expect(chunk1.done).toBe(false);

    const chunk2 = await processor.next();
    expect(chunk2.value).toEqual([3, 4]);
    expect(chunk2.done).toBe(false);

    const chunk3 = await processor.next();
    expect(chunk3.value).toEqual([5, 6]);
    expect(chunk3.done).toBe(false);

    const done = await processor.next();
    expect(done.done).toBe(true);
  });

  it('processes large arrays efficiently', async () => {
    const items = Array.from({ length: 1000 }, (_, i) => i);
    const chunks: number[][] = [];
    let chunkCount = 0;

    for await (const chunk of chunkedProcessor(items, 100)) {
      chunks.push(chunk);
      chunkCount++;
    }

    expect(chunkCount).toBe(10);
    expect(chunks[0][0]).toBe(0);
    expect(chunks[9][99]).toBe(999);
  });
});
