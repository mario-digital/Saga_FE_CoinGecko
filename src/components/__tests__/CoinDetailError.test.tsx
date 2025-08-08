import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoinDetailError } from '../CoinDetailError';
import { useRouter } from 'next/navigation';
import {
  CoinNotFoundError,
  NetworkError,
  RateLimitError,
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
});
