/**
 * Virtual scrolling hook for performance optimization
 * Only renders visible items to reduce DOM nodes and improve performance
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  scrollDebounceMs?: number;
}

interface VirtualScrollResult<T> {
  visibleItems: T[];
  totalHeight: number;
  offsetY: number;
  startIndex: number;
  endIndex: number;
}

export function useVirtualScroll<T>(
  items: T[],
  options: UseVirtualScrollOptions
): VirtualScrollResult<T> {
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    scrollDebounceMs = 10,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  // Debounced scroll handler
  const handleScroll = useCallback(
    (scrollPosition: number) => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setScrollTop(scrollPosition);
      }, scrollDebounceMs);
    },
    [scrollDebounceMs]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
  };
}
