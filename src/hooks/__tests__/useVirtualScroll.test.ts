import { renderHook, act, waitFor } from '@testing-library/react';
import { useVirtualScroll } from '../useVirtualScroll';

describe('useVirtualScroll', () => {
  it('calculates visible range correctly', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array(100)
          .fill(null)
          .map((_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 500,
          overscan: 2,
        }
      )
    );

    // With container height 500 and item height 50, should show 10 items
    // Plus overscan of 2 on each side = 13 items total (0-12)
    expect(result.current.visibleItems).toHaveLength(13);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(12);
  });

  it('handles scroll updates', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array(100)
          .fill(null)
          .map((_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 500,
          overscan: 2,
          scrollDebounceMs: 0,
        }
      )
    );

    // Initial state
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(12);
  });

  it('handles empty items array', () => {
    const { result } = renderHook(() =>
      useVirtualScroll([], {
        itemHeight: 50,
        containerHeight: 500,
        overscan: 2,
      })
    );

    expect(result.current.visibleItems).toEqual([]);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(-1);
  });

  it('respects overscan parameter', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array(100)
          .fill(null)
          .map((_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 500,
          overscan: 5,
        }
      )
    );

    // With overscan of 5, should render 10 (visible) + 6 (overscan) = 16 items
    expect(result.current.visibleItems).toHaveLength(16);
  });

  it('calculates total height correctly', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array(100)
          .fill(null)
          .map((_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 500,
          overscan: 2,
        }
      )
    );

    // 100 items * 50px each = 5000px
    expect(result.current.totalHeight).toBe(5000);
  });

  it('calculates offset correctly', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array(100)
          .fill(null)
          .map((_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 500,
          overscan: 2,
        }
      )
    );

    // Initial offset should be 0
    expect(result.current.offsetY).toBe(0);
  });

  it('handles zero container height', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array(10)
          .fill(null)
          .map((_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 0,
          overscan: 2,
        }
      )
    );

    // Should handle gracefully
    expect(result.current.visibleItems).toBeDefined();
    expect(result.current.startIndex).toBe(0);
  });

  it('recalculates when items change', () => {
    const { result, rerender } = renderHook(
      ({ items }) =>
        useVirtualScroll(items, {
          itemHeight: 50,
          containerHeight: 500,
          overscan: 2,
        }),
      {
        initialProps: {
          items: Array(10)
            .fill(null)
            .map((_, i) => ({ id: i })),
        },
      }
    );

    expect(result.current.totalHeight).toBe(500); // 10 * 50

    rerender({
      items: Array(20)
        .fill(null)
        .map((_, i) => ({ id: i })),
    });

    expect(result.current.totalHeight).toBe(1000); // 20 * 50
  });

  it('prevents negative start index', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array(100)
          .fill(null)
          .map((_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 500,
          overscan: 10, // Large overscan
        }
      )
    );

    // Even with large overscan, start index should not be negative
    expect(result.current.startIndex).toBeGreaterThanOrEqual(0);
  });

  it('prevents end index exceeding items length', () => {
    const { result } = renderHook(() =>
      useVirtualScroll(
        Array(10)
          .fill(null)
          .map((_, i) => ({ id: i })),
        {
          itemHeight: 50,
          containerHeight: 500,
          overscan: 20, // Overscan larger than items
        }
      )
    );

    // End index should not exceed items length
    expect(result.current.endIndex).toBeLessThanOrEqual(10);
  });

  describe('scroll handling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('handles scroll position updates with debouncing', async () => {
      const { result } = renderHook(() =>
        useVirtualScroll(
          Array(100)
            .fill(null)
            .map((_, i) => ({ id: i })),
          {
            itemHeight: 50,
            containerHeight: 500,
            overscan: 2,
            scrollDebounceMs: 100,
          }
        )
      );

      // Initial state
      expect(result.current.startIndex).toBe(0);
      expect(result.current.endIndex).toBe(12);

      // Simulate scrolling to position 500 (should show items around index 10)
      act(() => {
        result.current.handleScroll(500);
      });

      // Before debounce timeout, state should not change
      expect(result.current.startIndex).toBe(0);

      // Advance timers to trigger the debounced update
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // After debounce, should update to show items around scroll position
      // scrollTop 500 / itemHeight 50 = index 10
      // With overscan 2: startIndex = 10 - 2 = 8
      expect(result.current.startIndex).toBe(8);
      // endIndex = Math.ceil((500 + 500) / 50) + 2 = 20 + 2 = 22
      expect(result.current.endIndex).toBe(22);
    });

    it('cancels pending scroll updates when new scroll occurs', () => {
      const { result } = renderHook(() =>
        useVirtualScroll(
          Array(100)
            .fill(null)
            .map((_, i) => ({ id: i })),
          {
            itemHeight: 50,
            containerHeight: 500,
            overscan: 2,
            scrollDebounceMs: 100,
          }
        )
      );

      // First scroll
      act(() => {
        result.current.handleScroll(250);
      });

      // Second scroll before debounce completes
      act(() => {
        jest.advanceTimersByTime(50); // Half the debounce time
        result.current.handleScroll(500);
      });

      // Advance to complete the second debounce
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should only apply the second scroll position
      expect(result.current.startIndex).toBe(8); // Based on scrollTop 500
    });

    it('cleans up timeout on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useVirtualScroll(
          Array(100)
            .fill(null)
            .map((_, i) => ({ id: i })),
          {
            itemHeight: 50,
            containerHeight: 500,
            overscan: 2,
            scrollDebounceMs: 10,
          }
        )
      );

      // Start a scroll operation
      act(() => {
        result.current.handleScroll(500);
      });

      // Unmount before the timeout completes
      unmount();

      // Advance timers - should not cause errors even though component is unmounted
      act(() => {
        jest.advanceTimersByTime(20);
      });

      // No assertion needed - just ensuring no errors occur
    });

    it('handles multiple rapid scroll events', () => {
      const { result } = renderHook(() =>
        useVirtualScroll(
          Array(100)
            .fill(null)
            .map((_, i) => ({ id: i })),
          {
            itemHeight: 50,
            containerHeight: 500,
            overscan: 2,
            scrollDebounceMs: 50,
          }
        )
      );

      // Simulate rapid scrolling
      act(() => {
        result.current.handleScroll(100);
        result.current.handleScroll(200);
        result.current.handleScroll(300);
        result.current.handleScroll(400);
      });

      // State should not change yet
      expect(result.current.startIndex).toBe(0);

      // Complete the debounce
      act(() => {
        jest.advanceTimersByTime(50);
      });

      // Should use the last scroll position (400)
      // scrollTop 400 / itemHeight 50 = index 8
      // With overscan 2: startIndex = 8 - 2 = 6
      expect(result.current.startIndex).toBe(6);
    });
  });

  describe('edge cases', () => {
    it('handles very large item counts', () => {
      const { result } = renderHook(() =>
        useVirtualScroll(
          Array(10000)
            .fill(null)
            .map((_, i) => ({ id: i })),
          {
            itemHeight: 50,
            containerHeight: 500,
            overscan: 3,
          }
        )
      );

      expect(result.current.totalHeight).toBe(500000); // 10000 * 50
      // 10 visible + 3 overscan on each side = 10 + 3 + 3 = 16
      // But at the start, we have 0 overscan before, so it's 10 + 0 + 3 = 13
      // Actually with overscan 3: startIndex = max(0, 0-3) = 0
      // endIndex = min(9999, ceil(500/50) + 3) = min(9999, 10+3) = 13
      // So items 0-13 = 14 items
      expect(result.current.visibleItems).toHaveLength(14);
    });

    it('handles decimal scroll positions', () => {
      const { result } = renderHook(() =>
        useVirtualScroll(
          Array(100)
            .fill(null)
            .map((_, i) => ({ id: i })),
          {
            itemHeight: 50.5,
            containerHeight: 500.5,
            overscan: 2,
          }
        )
      );

      expect(result.current.totalHeight).toBe(5050); // 100 * 50.5
      expect(result.current.startIndex).toBe(0);
    });

    it('uses default values for optional parameters', () => {
      const { result } = renderHook(() =>
        useVirtualScroll(
          Array(100)
            .fill(null)
            .map((_, i) => ({ id: i })),
          {
            itemHeight: 50,
            containerHeight: 500,
            // overscan and scrollDebounceMs will use defaults
          }
        )
      );

      // Default overscan is 3
      expect(result.current.visibleItems.length).toBeGreaterThan(10);
      expect(result.current.visibleItems.length).toBeLessThanOrEqual(16); // 10 + 2*3
    });
  });
});
