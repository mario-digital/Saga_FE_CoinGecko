/**
 * Tests for useSwipeGesture hook
 */

import { renderHook, act } from '@testing-library/react';
import { TouchEvent } from 'react';
import { useSwipeGesture } from '../useSwipeGesture';

describe('useSwipeGesture', () => {
  const mockHandlers = {
    onSwipeLeft: jest.fn(),
    onSwipeRight: jest.fn(),
    onSwipeUp: jest.fn(),
    onSwipeDown: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createTouchEvent = (
    clientX: number,
    clientY: number
  ): Partial<TouchEvent> => ({
    touches: [{ clientX, clientY }] as any,
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    expect(result.current.swipeState).toEqual({
      isSwiping: false,
      direction: null,
      deltaX: 0,
      deltaY: 0,
    });
  });

  it('detects left swipe gesture', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(40, 100) as TouchEvent
      );
    });

    expect(result.current.swipeState.direction).toBe('left');
    expect(result.current.swipeState.deltaX).toBe(-60);

    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(mockHandlers.onSwipeLeft).toHaveBeenCalled();
  });

  it('detects right swipe gesture', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(160, 100) as TouchEvent
      );
    });

    expect(result.current.swipeState.direction).toBe('right');
    expect(result.current.swipeState.deltaX).toBe(60);

    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(mockHandlers.onSwipeRight).toHaveBeenCalled();
  });

  it('detects up swipe gesture', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(100, 40) as TouchEvent
      );
    });

    expect(result.current.swipeState.direction).toBe('up');
    expect(result.current.swipeState.deltaY).toBe(-60);

    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(mockHandlers.onSwipeUp).toHaveBeenCalled();
  });

  it('detects down swipe gesture', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(100, 160) as TouchEvent
      );
    });

    expect(result.current.swipeState.direction).toBe('down');
    expect(result.current.swipeState.deltaY).toBe(60);

    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(mockHandlers.onSwipeDown).toHaveBeenCalled();
  });

  it('does not trigger swipe for small movements', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(120, 100) as TouchEvent // Only 20px movement
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(mockHandlers.onSwipeLeft).not.toHaveBeenCalled();
    expect(mockHandlers.onSwipeRight).not.toHaveBeenCalled();
  });

  it('updates swipe state during movement', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    expect(result.current.swipeState.isSwiping).toBe(true);

    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(80, 100) as TouchEvent
      );
    });

    expect(result.current.swipeState.isSwiping).toBe(true);
    expect(result.current.swipeState.deltaX).toBe(-20);
    expect(result.current.swipeState.direction).toBe('left');

    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(result.current.swipeState.isSwiping).toBe(false);
    expect(result.current.swipeState.deltaX).toBe(0);
    expect(result.current.swipeState.direction).toBe(null);
  });

  it('determines direction based on larger delta', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    // Move diagonally but more horizontally
    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(40, 120) as TouchEvent
      );
    });

    expect(result.current.swipeState.direction).toBe('left'); // Horizontal wins

    // Reset
    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    // Move diagonally but more vertically
    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(120, 40) as TouchEvent
      );
    });

    expect(result.current.swipeState.direction).toBe('up'); // Vertical wins
  });

  it('handles missing handlers gracefully', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft: mockHandlers.onSwipeLeft })
    );

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    // Try to swipe right (no handler)
    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(160, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    // Should not throw error
    expect(mockHandlers.onSwipeLeft).not.toHaveBeenCalled();
  });

  it('resets state after swipe completion', () => {
    const { result } = renderHook(() => useSwipeGesture(mockHandlers));

    act(() => {
      result.current.swipeHandlers.onTouchStart(
        createTouchEvent(100, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchMove(
        createTouchEvent(40, 100) as TouchEvent
      );
    });

    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    // State should be reset
    expect(result.current.swipeState).toEqual({
      isSwiping: false,
      direction: null,
      deltaX: 0,
      deltaY: 0,
    });
  });
});
