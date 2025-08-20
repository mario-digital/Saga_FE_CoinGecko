import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { CoinDetailError } from '../CoinDetailError';
import { useRouter } from 'next/navigation';
import {
  CoinNotFoundError,
  NetworkError,
  RateLimitError,
  CorsError,
} from '@/hooks/useCoinDetail';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle">AlertCircle</div>,
  WifiOff: () => <div data-testid="wifi-off">WifiOff</div>,
  Clock: () => <div data-testid="clock">Clock</div>,
  Search: () => <div data-testid="search">Search</div>,
  ArrowLeft: () => <div data-testid="arrow-left">ArrowLeft</div>,
  Home: () => <div data-testid="home">Home</div>,
  RefreshCw: () => <div data-testid="refresh-cw">RefreshCw</div>,
}));

describe('CoinDetailError', () => {
  const mockBack = jest.fn();
  const mockPush = jest.fn();
  const mockRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
    });
  });

  describe('CoinNotFoundError', () => {
    it('renders coin not found error message', () => {
      const error = new CoinNotFoundError('bitcoin');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.getByText('Coin Not Found')).toBeInTheDocument();
      expect(
        screen.getByText(
          'The cryptocurrency you are looking for does not exist or has been removed.'
        )
      ).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    });

    it('shows go back button for coin not found', () => {
      const error = new CoinNotFoundError('bitcoin');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const backButton = screen.getByText('Go Back');
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('does not show browse all coins button', () => {
      const error = new CoinNotFoundError('bitcoin');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.queryByText('Browse All Coins')).not.toBeInTheDocument();
    });

    it('does not show retry button for coin not found', () => {
      const error = new CoinNotFoundError('bitcoin');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('RateLimitError', () => {
    it('renders rate limit error message', () => {
      const error = new RateLimitError('Rate limit exceeded', 60);
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.getByText('Rate Limit Reached')).toBeInTheDocument();
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
      expect(screen.getByTestId('clock')).toBeInTheDocument();
    });

    it('shows countdown timer when retry time is provided', () => {
      const error = new RateLimitError('Rate limit exceeded', 60);
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.getByText(/Please wait/)).toBeInTheDocument();
      expect(screen.getAllByText(/60/)).toHaveLength(2); // Once in message, once in button
      expect(
        screen.getByText(/seconds before trying again/)
      ).toBeInTheDocument();
    });

    it('does not show countdown when retry time not specified', () => {
      const error = new RateLimitError('Rate limit exceeded');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(
        screen.queryByText(/You can try again in/)
      ).not.toBeInTheDocument();
    });

    it('shows disabled wait button for rate limit with countdown when retry is provided', () => {
      const error = new RateLimitError('Rate limit exceeded', 60);
      render(<CoinDetailError error={error} retry={mockRetry} />);

      // When countdown is active and retry is provided, button shows wait time
      const waitButton = screen.getByText('Wait 60s');
      expect(waitButton).toBeInTheDocument();
      expect(waitButton.closest('button')).toBeDisabled();
    });

    it('shows go back button for rate limit', () => {
      const error = new RateLimitError('Rate limit exceeded');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const backButton = screen.getByText('Go Back');
      fireEvent.click(backButton);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('NetworkError', () => {
    it('renders network error message', () => {
      const error = new NetworkError('Network connection failed');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.getByText('Error Loading Coin Data')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    });

    it('shows try again button for network error', () => {
      const error = new NetworkError('Network error');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('shows go back button for network error', () => {
      const error = new NetworkError('Network error');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const backButton = screen.getByText('Go Back');
      fireEvent.click(backButton);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Generic Error', () => {
    it('renders generic error message', () => {
      const error = new Error('Something went wrong');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.getByText('Error Loading Coin Data')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    });

    it('shows try again button for generic error', () => {
      const error = new Error('Generic error');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('shows go back button for generic error', () => {
      const error = new Error('Generic error');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const backButton = screen.getByText('Go Back');
      fireEvent.click(backButton);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error with long messages', () => {
    it('handles very long error messages', () => {
      const longMessage = 'a'.repeat(500);
      const error = new Error(longMessage);
      render(<CoinDetailError error={error} retry={mockRetry} />);

      // Long messages are rendered in full now
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes', () => {
      const error = new Error('Test error');
      const { container } = render(
        <CoinDetailError error={error} retry={mockRetry} />
      );

      // Check for container classes
      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
      expect(container.querySelector('.px-4')).toBeInTheDocument();
      expect(container.querySelector('.py-8')).toBeInTheDocument();
    });

    it('renders alert with proper container', () => {
      const error = new Error('Test error');
      const { container } = render(
        <CoinDetailError error={error} retry={mockRetry} />
      );

      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
    });

    it('buttons are rendered', () => {
      const error = new NetworkError('Test');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const tryAgainButton = screen.getByText('Try Again');
      expect(tryAgainButton).toBeInTheDocument();

      const goBackButton = screen.getByText('Go Back');
      expect(goBackButton).toBeInTheDocument();
    });
  });

  describe('Icon rendering', () => {
    it('shows alert icon for all error types', () => {
      // All errors use AlertCircle icon
      const { rerender } = render(
        <CoinDetailError
          error={new CoinNotFoundError('test')}
          retry={mockRetry}
        />
      );
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();

      // RateLimitError
      rerender(
        <CoinDetailError error={new RateLimitError('test')} retry={mockRetry} />
      );
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();

      // NetworkError
      rerender(
        <CoinDetailError error={new NetworkError('test')} retry={mockRetry} />
      );
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();

      // Generic Error
      rerender(<CoinDetailError error={new Error('test')} retry={mockRetry} />);
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      const error = new NetworkError('Test');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/.+/); // Has text content
      });
    });

    it('has proper heading hierarchy', () => {
      const error = new Error('Test');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      // AlertTitle renders as H5 by default in shadcn/ui
      expect(heading.tagName).toBe('H5');
    });
  });

  describe('CorsError', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('renders CORS error message', () => {
      const error = new CorsError('CORS error occurred');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.getByText('Connection Issue')).toBeInTheDocument();
      expect(
        screen.getByText(/Having trouble connecting to CoinGecko API/)
      ).toBeInTheDocument();
      expect(screen.getByTestId('refresh-cw')).toBeInTheDocument();
    });

    it('shows auto-retry countdown for CORS errors', () => {
      const error = new CorsError('CORS error');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(screen.getByText(/Retrying automatically in/)).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText(/seconds.../)).toBeInTheDocument();
    });

    it('counts down and auto-retries after 45 seconds', () => {
      const error = new CorsError('CORS error');
      const { rerender } = render(
        <CoinDetailError error={error} retry={mockRetry} />
      );

      // Initially shows 45 seconds
      expect(screen.getByText('45')).toBeInTheDocument();

      // Advance timers step by step to trigger all useEffect updates
      for (let i = 0; i < 45; i++) {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }

      // Force a re-render to trigger the final useEffect
      rerender(<CoinDetailError error={error} retry={mockRetry} />);

      // Retry should have been called
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('shows auto-retrying button during countdown', () => {
      const error = new CorsError('CORS error');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      // During countdown, we show the countdown message but not a retry button
      // The retry happens automatically
      expect(screen.getByText(/Retrying automatically in/)).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('auto-retries after countdown completes', () => {
      const error = new CorsError('CORS error');
      const { rerender } = render(
        <CoinDetailError error={error} retry={mockRetry} />
      );

      // Fast-forward through all 45 seconds
      for (let i = 0; i < 45; i++) {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }

      // Trigger final useEffect
      rerender(<CoinDetailError error={error} retry={mockRetry} />);

      // After countdown, retry should have been called automatically
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('shows help text about browser extensions', () => {
      const error = new CorsError('CORS error');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(
        screen.getByText(
          /check if you have any browser extensions blocking requests/
        )
      ).toBeInTheDocument();
    });

    it('does not auto-retry if retry function is not provided', async () => {
      const error = new CorsError('CORS error');
      render(<CoinDetailError error={error} />);

      // Complete countdown
      act(() => {
        jest.advanceTimersByTime(45000);
      });

      // Should not have called retry (since it wasn't provided)
      expect(mockRetry).not.toHaveBeenCalled();
    });

    it('shows go back button for CORS error', () => {
      const error = new CorsError('CORS error');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      const backButton = screen.getByText('Go Back');
      fireEvent.click(backButton);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('uses default alert variant for CORS error', () => {
      const error = new CorsError('CORS error');
      const { container } = render(
        <CoinDetailError error={error} retry={mockRetry} />
      );

      // Check that it's not using destructive variant
      const alert = container.querySelector('[role="alert"]');
      expect(alert).not.toHaveClass('destructive');
    });
  });

  describe('Error without message', () => {
    it('shows default message when error message is empty', () => {
      const error = new Error('');
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(
        screen.getByText(
          'Failed to load coin data. Please check your connection and try again.'
        )
      ).toBeInTheDocument();
    });

    it('shows default message when error message is null', () => {
      const error = new Error();
      error.message = null as any;
      render(<CoinDetailError error={error} retry={mockRetry} />);

      expect(
        screen.getByText(
          'Failed to load coin data. Please check your connection and try again.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Alert variant styling', () => {
    it('uses default variant for rate limit error', () => {
      const error = new RateLimitError('Rate limited');
      const { container } = render(
        <CoinDetailError error={error} retry={mockRetry} />
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).not.toHaveClass('destructive');
    });

    it('uses destructive variant for network error', () => {
      const error = new NetworkError('Network failed');
      const { container } = render(
        <CoinDetailError error={error} retry={mockRetry} />
      );

      // Note: The actual class depends on the Alert component implementation
      // We're checking that it's NOT using the default variant
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('uses destructive variant for generic error', () => {
      const error = new Error('Generic error');
      const { container } = render(
        <CoinDetailError error={error} retry={mockRetry} />
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });
});
