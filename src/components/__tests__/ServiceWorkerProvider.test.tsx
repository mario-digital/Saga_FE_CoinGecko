import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServiceWorkerProvider } from '../ServiceWorkerProvider';

// Mock the useServiceWorker hook
jest.mock('@/hooks/useServiceWorker', () => ({
  useServiceWorker: jest.fn(),
}));

describe('ServiceWorkerProvider', () => {
  const mockUseServiceWorker =
    require('@/hooks/useServiceWorker').useServiceWorker;
  const mockUpdateServiceWorker = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.confirm mock
    window.confirm = jest.fn();
  });

  it('renders children correctly', () => {
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: false,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    const { container } = render(
      <ServiceWorkerProvider>
        <div>Test Child Component</div>
      </ServiceWorkerProvider>
    );

    expect(screen.getByText('Test Child Component')).toBeInTheDocument();
  });

  it('does not show update prompt when no update is available', () => {
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: false,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    const { container } = render(
      <ServiceWorkerProvider>
        <div>Content</div>
      </ServiceWorkerProvider>
    );

    expect(window.confirm).not.toHaveBeenCalled();
    expect(mockUpdateServiceWorker).not.toHaveBeenCalled();
  });

  it('shows update prompt when update is available and user confirms', async () => {
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: true,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    (window.confirm as jest.Mock).mockReturnValue(true);

    const { container } = render(
      <ServiceWorkerProvider>
        <div>Content</div>
      </ServiceWorkerProvider>
    );

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        'A new version is available. Would you like to update?'
      );
      expect(mockUpdateServiceWorker).toHaveBeenCalled();
    });
  });

  it('shows update prompt when update is available but user cancels', async () => {
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: true,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    (window.confirm as jest.Mock).mockReturnValue(false);

    const { container } = render(
      <ServiceWorkerProvider>
        <div>Content</div>
      </ServiceWorkerProvider>
    );

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        'A new version is available. Would you like to update?'
      );
      expect(mockUpdateServiceWorker).not.toHaveBeenCalled();
    });
  });

  it('handles multiple children', () => {
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: false,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    const { container } = render(
      <ServiceWorkerProvider>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </ServiceWorkerProvider>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });

  it('handles update becoming available after initial render', async () => {
    const { rerender } = render(
      <ServiceWorkerProvider>
        <div>Content</div>
      </ServiceWorkerProvider>
    );

    // Initially no update
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: false,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    expect(window.confirm).not.toHaveBeenCalled();

    // Update becomes available
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: true,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    (window.confirm as jest.Mock).mockReturnValue(true);

    rerender(
      <ServiceWorkerProvider>
        <div>Content</div>
      </ServiceWorkerProvider>
    );

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockUpdateServiceWorker).toHaveBeenCalled();
    });
  });

  it('only prompts once for the same update', async () => {
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: true,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    (window.confirm as jest.Mock).mockReturnValue(false);

    const { rerender } = render(
      <ServiceWorkerProvider>
        <div>Content</div>
      </ServiceWorkerProvider>
    );

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledTimes(1);
    });

    // Rerender with same state
    rerender(
      <ServiceWorkerProvider>
        <div>Content</div>
      </ServiceWorkerProvider>
    );

    // Should not prompt again for the same update
    expect(window.confirm).toHaveBeenCalledTimes(1);
  });

  it('renders without children', () => {
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: false,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    const { container } = render(
      <ServiceWorkerProvider>{null}</ServiceWorkerProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles fragment children', () => {
    mockUseServiceWorker.mockReturnValue({
      isUpdateAvailable: false,
      updateServiceWorker: mockUpdateServiceWorker,
    });

    const { container } = render(
      <ServiceWorkerProvider>
        <>
          <div>Fragment Child 1</div>
          <div>Fragment Child 2</div>
        </>
      </ServiceWorkerProvider>
    );

    expect(screen.getByText('Fragment Child 1')).toBeInTheDocument();
    expect(screen.getByText('Fragment Child 2')).toBeInTheDocument();
  });
});
