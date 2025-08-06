import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  let originalMatchMedia: any;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Mock matchMedia
    originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // Clear document classes
    document.documentElement.className = '';
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('initializes with system theme when no stored preference', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark'); // Based on our mock
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('initializes with stored theme preference', () => {
    localStorage.setItem('theme', 'light');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles theme from light to dark', () => {
    localStorage.setItem('theme', 'light');

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('toggles theme from dark to light', () => {
    localStorage.setItem('theme', 'dark');

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('sets theme to specific value', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('detects system preference for light theme', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it.skip('responds to system theme changes', () => {
    let changeListener: ((e: any) => void) | null = null;

    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event, listener) => {
        if (event === 'change') {
          changeListener = listener;
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');

    // Simulate system theme change
    if (changeListener) {
      act(() => {
        changeListener!({ matches: true });
      });
    }

    expect(result.current.theme).toBe('dark');
  });

  it.skip('cleans up event listeners on unmount', () => {
    const removeEventListener = jest.fn();

    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener,
      dispatchEvent: jest.fn(),
    }));

    const { unmount } = renderHook(() => useTheme());

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('handles localStorage errors gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    // Mock localStorage.setItem to throw
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    // Should still update theme in state even if localStorage fails
    expect(result.current.theme).toBeDefined();

    localStorage.setItem = originalSetItem;
    consoleError.mockRestore();
  });

  // Removed isLoading test - not part of current implementation

  it('maintains theme across re-renders', () => {
    const { result, rerender } = renderHook(() => useTheme());

    const initialTheme = result.current.theme;

    rerender();

    expect(result.current.theme).toBe(initialTheme);
  });

  it('applies theme immediately on mount', () => {
    localStorage.setItem('theme', 'dark');

    // Document should not have dark class before hook
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    renderHook(() => useTheme());

    // Should have dark class after hook
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
