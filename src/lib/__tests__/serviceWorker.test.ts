/**
 * @jest-environment jsdom
 */

import {
  registerServiceWorker,
  unregisterServiceWorker,
  clearServiceWorkerCache,
} from '../serviceWorker';

describe('Service Worker Functions', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let mockRegistration: any;
  let mockServiceWorker: any;
  let originalSetInterval: typeof setInterval;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Store original setInterval
    originalSetInterval = global.setInterval;

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Setup default mock registration
    mockRegistration = {
      scope: '/',
      update: jest.fn(),
      addEventListener: jest.fn(),
      installing: null,
    };

    // Setup default mock service worker
    mockServiceWorker = {
      register: jest.fn().mockResolvedValue(mockRegistration),
      controller: null,
      addEventListener: jest.fn(),
      getRegistrations: jest.fn().mockResolvedValue([]),
    };

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true,
    });

    // Mock document.visibilityState
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });

    // Mock window.location.reload
    delete (window as any).location;
    window.location = { reload: jest.fn() } as any;
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Clean up navigator.serviceWorker mock
    if (Object.getOwnPropertyDescriptor(navigator, 'serviceWorker')) {
      delete (navigator as any).serviceWorker;
    }
  });

  describe('registerServiceWorker', () => {
    it('registers service worker successfully when supported', async () => {
      const result = await registerServiceWorker();

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      expect(result).toBe(mockRegistration);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Service Worker registered successfully:',
        '/'
      );
      expect(mockRegistration.update).toHaveBeenCalled();
    });

    it('sets up periodic updates when page is visible', async () => {
      await registerServiceWorker();

      // Fast forward time to trigger interval
      jest.advanceTimersByTime(30000);

      // Update should be called twice - once on register, once from interval
      expect(mockRegistration.update).toHaveBeenCalledTimes(2);
    });

    it('does not set up updates when page is not visible', async () => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true,
      });

      await registerServiceWorker();

      // Fast forward time - update should not be called again since interval wasn't set
      jest.advanceTimersByTime(30000);

      // Update should only be called once - on register, not from interval
      expect(mockRegistration.update).toHaveBeenCalledTimes(1);
    });

    it('handles update found event with new worker', async () => {
      const mockPostMessage = jest.fn();
      const mockNewWorker = {
        state: 'installing',
        addEventListener: jest.fn(),
        postMessage: mockPostMessage,
      };

      // Set up controller to trigger auto-update
      mockServiceWorker.controller = {};

      await registerServiceWorker();

      // Get the updatefound callback
      const updateFoundCall = mockRegistration.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'updatefound'
      );
      expect(updateFoundCall).toBeDefined();
      const updateFoundCallback = updateFoundCall[1];

      // Simulate update found with new worker
      mockRegistration.installing = mockNewWorker;
      updateFoundCallback();

      expect(mockNewWorker.addEventListener).toHaveBeenCalledWith(
        'statechange',
        expect.any(Function)
      );

      // Get the statechange callback
      const stateChangeCallback =
        mockNewWorker.addEventListener.mock.calls[0][1];

      // Simulate state change to installed
      mockNewWorker.state = 'installed';
      stateChangeCallback();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'New service worker available, refresh to update'
      );

      // Fast-forward timer for auto-update
      jest.advanceTimersByTime(5000);

      expect(mockPostMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('does not auto-update when no controller exists', async () => {
      const mockNewWorker = {
        state: 'installing',
        addEventListener: jest.fn(),
        postMessage: jest.fn(),
      };

      // No controller
      mockServiceWorker.controller = null;

      await registerServiceWorker();

      const updateFoundCallback =
        mockRegistration.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'updatefound'
        )[1];

      mockRegistration.installing = mockNewWorker;
      updateFoundCallback();

      const stateChangeCallback =
        mockNewWorker.addEventListener.mock.calls[0][1];
      mockNewWorker.state = 'installed';
      stateChangeCallback();

      jest.advanceTimersByTime(5000);

      expect(mockNewWorker.postMessage).not.toHaveBeenCalled();
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('handles controller change event', async () => {
      await registerServiceWorker();

      const controllerChangeCall =
        mockServiceWorker.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'controllerchange'
        );
      expect(controllerChangeCall).toBeDefined();
      const controllerChangeCallback = controllerChangeCall[1];

      controllerChangeCallback();

      expect(consoleLogSpy).toHaveBeenCalledWith('Service worker updated');
    });

    it('handles registration errors', async () => {
      const error = new Error('Registration failed');
      mockServiceWorker.register.mockRejectedValue(error);

      const result = await registerServiceWorker();

      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Service Worker registration failed:',
        error
      );
    });

    it('does nothing when serviceWorker is not supported', async () => {
      delete (navigator as any).serviceWorker;

      const result = await registerServiceWorker();

      expect(result).toBeUndefined();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('handles case when no installing worker during update', async () => {
      await registerServiceWorker();

      const updateFoundCallback =
        mockRegistration.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'updatefound'
        )[1];

      // Call without installing worker (installing is null)
      mockRegistration.installing = null;
      updateFoundCallback();

      // Should not throw error
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles different worker states', async () => {
      const mockNewWorker = {
        state: 'installing',
        addEventListener: jest.fn(),
        postMessage: jest.fn(),
      };

      mockServiceWorker.controller = {};

      await registerServiceWorker();

      const updateFoundCallback =
        mockRegistration.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'updatefound'
        )[1];

      mockRegistration.installing = mockNewWorker;
      updateFoundCallback();

      const stateChangeCallback =
        mockNewWorker.addEventListener.mock.calls[0][1];

      // Test with non-installed state
      mockNewWorker.state = 'waiting';
      stateChangeCallback();

      // Should not trigger auto-update
      jest.advanceTimersByTime(5000);
      expect(mockNewWorker.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('unregisterServiceWorker', () => {
    it('unregisters all service workers successfully', async () => {
      const mockUnregister1 = jest.fn().mockResolvedValue(true);
      const mockUnregister2 = jest.fn().mockResolvedValue(true);

      const mockRegistrations = [
        { unregister: mockUnregister1 },
        { unregister: mockUnregister2 },
      ];

      mockServiceWorker.getRegistrations.mockResolvedValue(mockRegistrations);

      await unregisterServiceWorker();

      expect(mockUnregister1).toHaveBeenCalled();
      expect(mockUnregister2).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Service Worker unregistered');
    });

    it('handles empty registrations array', async () => {
      mockServiceWorker.getRegistrations.mockResolvedValue([]);

      await unregisterServiceWorker();

      expect(consoleLogSpy).toHaveBeenCalledWith('Service Worker unregistered');
    });

    it('handles unregistration errors', async () => {
      const error = new Error('Unregistration failed');
      mockServiceWorker.getRegistrations.mockRejectedValue(error);

      await unregisterServiceWorker();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Service Worker unregistration failed:',
        error
      );
    });

    it('does nothing when serviceWorker is not supported', async () => {
      delete (navigator as any).serviceWorker;

      await unregisterServiceWorker();

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles individual unregister failures', async () => {
      const error = new Error('Unregister failed');
      const mockUnregisterFail = jest.fn().mockRejectedValue(error);
      const mockUnregisterSuccess = jest.fn().mockResolvedValue(true);

      const mockRegistrations = [
        { unregister: mockUnregisterFail },
        { unregister: mockUnregisterSuccess },
      ];

      mockServiceWorker.getRegistrations.mockResolvedValue(mockRegistrations);

      await unregisterServiceWorker();

      expect(mockUnregisterFail).toHaveBeenCalled();
      // The second unregister won't be called because the first one throws
      expect(mockUnregisterSuccess).not.toHaveBeenCalled();
      // Error should be logged instead of success
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Service Worker unregistration failed:',
        error
      );
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        'Service Worker unregistered'
      );
    });
  });

  describe('clearServiceWorkerCache', () => {
    it('sends clear cache message when controller exists', async () => {
      const mockPostMessage = jest.fn();
      const mockController = {
        postMessage: mockPostMessage,
      };

      mockServiceWorker.controller = mockController;

      await clearServiceWorkerCache();

      expect(mockPostMessage).toHaveBeenCalledWith({ type: 'CLEAR_CACHE' });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Service Worker cache cleared'
      );
    });

    it('does nothing when no controller exists', async () => {
      mockServiceWorker.controller = null;

      await clearServiceWorkerCache();

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('does nothing when serviceWorker is not supported', async () => {
      delete (navigator as any).serviceWorker;

      await clearServiceWorkerCache();

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
