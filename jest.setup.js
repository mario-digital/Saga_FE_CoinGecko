import '@testing-library/jest-dom';

// Configure React 19 testing environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Suppress specific console errors that are expected in tests
const originalError = console.error;
console.error = (...args) => {
  // Suppress act() warnings from cmdk library which don't affect test results
  if (
    typeof args[0] === 'string' &&
    args[0].includes(
      'The current testing environment is not configured to support act'
    )
  ) {
    return;
  }
  // Suppress unknown event handler warnings for library-specific props
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Unknown event handler property')
  ) {
    return;
  }
  // Suppress jsdom navigation errors (happens with anchor tags in tests)
  if (
    args[0] &&
    typeof args[0] === 'object' &&
    args[0].message === 'Not implemented: navigation (except hash changes)'
  ) {
    return;
  }
  originalError.call(console, ...args);
};

global.fetch = jest.fn();

// Only set up browser mocks if window is defined (jsdom environment)
if (typeof window !== 'undefined') {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
}
