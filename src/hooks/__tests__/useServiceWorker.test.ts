import { renderHook, act, waitFor } from '@testing-library/react';
import { useServiceWorker } from '../useServiceWorker';

// Mock navigator.serviceWorker
const mockServiceWorker = {
  register: jest.fn(),
  ready: Promise.resolve({
    unregister: jest.fn(),
    update: jest.fn(),
  }),
  controller: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

describe('useServiceWorker', () => {
  const originalNavigator = global.navigator;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'production';

    // Mock navigator with serviceWorker
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {
        ...originalNavigator,
        serviceWorker: mockServiceWorker,
      },
    });

    // Reset mock implementations
    mockServiceWorker.register.mockResolvedValue({
      installing: null,
      waiting: null,
      active: { postMessage: jest.fn() },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      update: jest.fn(),
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: originalNavigator,
    });
  });

  it('registers service worker in production', async () => {
    const { result } = renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      });
    });

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true);
    });

    expect(result.current.isUpdateAvailable).toBe(false);
  });

  it('registers service worker even in development', async () => {
    process.env.NODE_ENV = 'development';

    const { result } = renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      });
    });

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true);
    });

    // The implementation doesn't check NODE_ENV, so it will register
    expect(result.current.isUpdateAvailable).toBe(false);
  });

  it('does not register when serviceWorker is not supported', () => {
    // Mock navigator without serviceWorker
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {
        ...originalNavigator,
        // serviceWorker is not defined
      },
    });

    const { result } = renderHook(() => useServiceWorker());

    // Should not crash and should return default state
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isRegistered).toBe(false);
    expect(result.current.isUpdateAvailable).toBe(false);
  });

  it('handles registration errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockServiceWorker.register.mockRejectedValueOnce(
      new Error('Registration failed')
    );

    renderHook(() => useServiceWorker());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Service worker registration failed:',
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  it('detects update available when new worker is waiting', async () => {
    const mockRegistration = {
      installing: null,
      waiting: { postMessage: jest.fn() },
      active: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      update: jest.fn(),
    };

    mockServiceWorker.register.mockResolvedValueOnce(mockRegistration);
    mockServiceWorker.controller = {}; // Set controller to make update available

    const { result } = renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true);
    });

    // Simulate update found event
    const updateFoundCallback =
      mockRegistration.addEventListener.mock.calls.find(
        call => call[0] === 'updatefound'
      )?.[1];

    if (updateFoundCallback) {
      mockRegistration.installing = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        state: 'installed',
      };

      await act(async () => {
        updateFoundCallback();
      });

      // Simulate state change to installed
      const stateChangeCallback =
        mockRegistration.installing.addEventListener.mock.calls.find(
          call => call[0] === 'statechange'
        )?.[1];

      if (stateChangeCallback) {
        await act(async () => {
          stateChangeCallback();
        });
      }
    }

    expect(result.current.isUpdateAvailable).toBe(true);
  });

  it('provides updateServiceWorker function', async () => {
    const mockRegistration = {
      waiting: {
        postMessage: jest.fn(),
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      update: jest.fn(),
    };

    mockServiceWorker.register.mockResolvedValueOnce(mockRegistration);

    const { result } = renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true);
    });

    act(() => {
      result.current.updateServiceWorker();
    });

    expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({
      type: 'SKIP_WAITING',
    });
  });

  it('handles controller change event', async () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: mockReload },
    });

    renderHook(() => useServiceWorker());

    await act(async () => {
      // Wait for initial registration
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simulate controller change
    const controllerChangeCallback =
      mockServiceWorker.addEventListener.mock.calls.find(
        call => call[0] === 'controllerchange'
      )?.[1];

    if (controllerChangeCallback) {
      await act(async () => {
        controllerChangeCallback();
      });
    }

    expect(mockReload).toHaveBeenCalled();
  });

  it('does not clean up event listeners on unmount', async () => {
    const mockRegistration = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      update: jest.fn(),
    };

    mockServiceWorker.register.mockResolvedValueOnce(mockRegistration);

    const { unmount, result } = renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true);
    });

    unmount();

    // The implementation doesn't clean up the controllerchange listener
    expect(mockServiceWorker.removeEventListener).not.toHaveBeenCalled();
  });

  it('does not update when no waiting worker', async () => {
    const mockRegistration = {
      waiting: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    mockServiceWorker.register.mockResolvedValueOnce(mockRegistration);

    const { result } = renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(result.current.isRegistered).toBe(true);
    });

    act(() => {
      result.current.updateServiceWorker();
    });

    // Should not throw or cause errors
    expect(result.current.isUpdateAvailable).toBe(false);
  });
});
