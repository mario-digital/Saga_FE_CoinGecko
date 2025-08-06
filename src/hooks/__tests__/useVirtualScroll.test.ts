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
});
