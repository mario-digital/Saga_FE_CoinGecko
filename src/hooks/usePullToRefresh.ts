import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  refreshIndicatorHeight?: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  refreshIndicatorHeight = 60,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull if we're at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        // Apply some resistance to the pull
        const adjustedDistance = Math.pow(distance, 0.8);
        setPullDistance(Math.min(adjustedDistance, threshold * 1.5));

        // Prevent scrolling while pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;

      isPulling.current = false;

      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(refreshIndicatorHeight);

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    // Add passive: false to allow preventDefault
    const touchMoveOptions = { passive: false };

    document.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    document.addEventListener('touchmove', handleTouchMove, touchMoveOptions);
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    disabled,
    isRefreshing,
    onRefresh,
    pullDistance,
    refreshIndicatorHeight,
    threshold,
  ]);

  return {
    pullDistance,
    isRefreshing,
    isActive: pullDistance > 0 || isRefreshing,
  };
}
