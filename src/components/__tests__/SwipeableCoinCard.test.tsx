/**
 * Tests for SwipeableCoinCard component
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SwipeableCoinCard } from '../SwipeableCoinCard';
import { CoinData } from '@/types/coingecko';

const mockCoinData: CoinData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    total_volume: 25000000000,
    price_change_percentage_24h: 2.5,
    circulating_supply: 19500000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -34.78,
    last_updated: '2024-01-01T12:00:00.000Z',
  },
];

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock hooks
jest.mock('@/hooks/useSwipeGesture', () => ({
  useSwipeGesture: jest.fn(() => ({
    swipeState: { isSwiping: false, offsetX: 0 },
    swipeHandlers: {
      onTouchStart: jest.fn(),
      onTouchMove: jest.fn(),
      onTouchEnd: jest.fn(),
      onMouseDown: jest.fn(),
      onMouseMove: jest.fn(),
      onMouseUp: jest.fn(),
    },
  })),
}));

describe('SwipeableCoinCard', () => {
  const mockOnClick = jest.fn();
  const mockUseSwipeGesture =
    require('@/hooks/useSwipeGesture').useSwipeGesture;

  beforeEach(() => {
    mockOnClick.mockClear();
    jest.clearAllMocks();
  });

  it('renders coin information correctly', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('btc')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
    expect(screen.getByText('2.50%')).toBeInTheDocument();
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('Volume (24h)')).toBeInTheDocument();
  });

  it('shows swipe indicator on mobile', () => {
    // Mock window width for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    expect(screen.getByText('Swipe')).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    // Click on the coin name to trigger navigation
    const coinName = screen.getByText('Bitcoin');
    fireEvent.click(coinName);

    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
  });

  it('handles keyboard navigation', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByText('Bitcoin').closest('div[role="button"]')!;

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');

    mockOnClick.mockClear();

    // Test Space key
    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
  });

  it('handles touch events for swipe gestures', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByText('Bitcoin').closest('div')!.parentElement!;

    // Simulate swipe left
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });

    fireEvent.touchMove(card, {
      touches: [{ clientX: 20, clientY: 100 }],
    });

    fireEvent.touchEnd(card);

    // Should show additional details after swipe
    expect(screen.getByText('Additional Details')).toBeInTheDocument();
  });

  it('should handle swipe left to show details', () => {
    let swipeLeftCallback: Function;
    mockUseSwipeGesture.mockImplementation(({ onSwipeLeft }: any) => {
      swipeLeftCallback = onSwipeLeft;
      return {
        swipeState: { isSwiping: false, offsetX: 0 },
        swipeHandlers: {},
      };
    });

    const { rerender } = render(
      <SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />
    );

    // Trigger swipe left
    act(() => {
      swipeLeftCallback!();
    });
    rerender(
      <SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />
    );

    // Should update view to show details
    expect(mockUseSwipeGesture).toHaveBeenCalled();
  });

  it('should handle swipe right to show main view', () => {
    let swipeRightCallback: Function;
    mockUseSwipeGesture.mockImplementation(({ onSwipeRight }: any) => {
      swipeRightCallback = onSwipeRight;
      return {
        swipeState: { isSwiping: false, offsetX: 0 },
        swipeHandlers: {},
      };
    });

    const { rerender } = render(
      <SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />
    );

    // Trigger swipe right
    act(() => {
      swipeRightCallback!();
    });
    rerender(
      <SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />
    );

    // Should update view to show main
    expect(mockUseSwipeGesture).toHaveBeenCalled();
  });

  it('should not trigger onClick when swiping', () => {
    mockUseSwipeGesture.mockReturnValue({
      swipeState: { isSwiping: true, offsetX: 50 },
      swipeHandlers: {},
    });

    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByText('Bitcoin').closest('div[role="button"]')!;
    fireEvent.click(card);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should handle missing onClick prop', () => {
    mockUseSwipeGesture.mockReturnValue({
      swipeState: { isSwiping: false, offsetX: 0 },
      swipeHandlers: {},
    });

    render(<SwipeableCoinCard coin={mockCoinData[0]} />);

    const card = screen.getByText('Bitcoin').closest('div[role="button"]')!;

    // Should not throw error when clicked without onClick handler
    expect(() => fireEvent.click(card)).not.toThrow();
  });

  it('should apply transform based on swipe offset', () => {
    mockUseSwipeGesture.mockReturnValue({
      swipeState: { isSwiping: true, deltaX: -50 },
      swipeHandlers: {},
    });

    const { container } = render(
      <SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />
    );

    // Find the element with transform style
    const transformedElement = container.querySelector('[style*="transform"]');
    expect(transformedElement).toBeInTheDocument();
    expect(transformedElement?.getAttribute('style')).toContain(
      'translateX(-15px)'
    );
  });

  it('should handle coins with missing optional data', () => {
    const coinWithMissingData = {
      ...mockCoinData[0],
      ath: undefined,
      ath_change_percentage: undefined,
      max_supply: undefined,
    };

    render(
      <SwipeableCoinCard coin={coinWithMissingData} onClick={mockOnClick} />
    );

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.queryByText('ATH')).not.toBeInTheDocument();
  });

  it('shows additional coin details in swipe view', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByText('Bitcoin').closest('div')!.parentElement!;

    // Simulate swipe left to reveal details
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });

    fireEvent.touchMove(card, {
      touches: [{ clientX: 20, clientY: 100 }],
    });

    fireEvent.touchEnd(card);

    // Check for additional details
    expect(screen.getByText('Additional Details')).toBeInTheDocument();
    expect(screen.getByText('Circulating')).toBeInTheDocument();
    expect(screen.getByText('Max Supply')).toBeInTheDocument();
    expect(screen.getByText('ATH')).toBeInTheDocument();
    expect(screen.getByText('From ATH')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const coinWithLargeNumbers = {
      ...mockCoinData[0],
      circulating_supply: 19500000,
      max_supply: 21000000,
      ath: 69000,
      ath_change_percentage: -34.78,
    };

    render(
      <SwipeableCoinCard coin={coinWithLargeNumbers} onClick={mockOnClick} />
    );

    const card = screen.getByText('Bitcoin').closest('div')!.parentElement!;

    // Swipe to reveal details
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchMove(card, {
      touches: [{ clientX: 20, clientY: 100 }],
    });
    fireEvent.touchEnd(card);

    expect(screen.getByText('19.50M')).toBeInTheDocument();
    expect(screen.getByText('21.00M')).toBeInTheDocument();
    expect(screen.getByText('$69,000.00')).toBeInTheDocument();
    expect(screen.getByText('-34.78%')).toBeInTheDocument();
  });

  it('handles missing data gracefully', () => {
    const coinWithMissingData = {
      ...mockCoinData[0],
      circulating_supply: undefined,
      max_supply: undefined,
      ath: undefined,
      ath_change_percentage: undefined,
    };

    render(
      <SwipeableCoinCard coin={coinWithMissingData} onClick={mockOnClick} />
    );

    const card = screen.getByText('Bitcoin').closest('div')!.parentElement!;

    // Swipe to reveal details
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchMove(card, {
      touches: [{ clientX: 20, clientY: 100 }],
    });
    fireEvent.touchEnd(card);

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.queryByText('Max Supply')).not.toBeInTheDocument();
    expect(screen.queryByText('ATH')).not.toBeInTheDocument();
  });

  it('applies correct styling for price changes', () => {
    // Positive change
    const { rerender } = render(
      <SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />
    );

    let changeElement = screen.getByText('2.50%').closest('div');
    expect(changeElement).toHaveClass('text-success');

    // Negative change
    const negativeChangeCoin = {
      ...mockCoinData[0],
      price_change_percentage_24h: -5.25,
    };

    rerender(
      <SwipeableCoinCard coin={negativeChangeCoin} onClick={mockOnClick} />
    );

    changeElement = screen.getByText('5.25%').closest('div');
    expect(changeElement).toHaveClass('text-danger');
  });

  it('does not trigger click when swiping', () => {
    render(<SwipeableCoinCard coin={mockCoinData[0]} onClick={mockOnClick} />);

    const card = screen.getByText('Bitcoin').closest('div[role="button"]')!;

    // Start swipe
    fireEvent.touchStart(card.parentElement!.parentElement!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });

    // Move (swipe)
    fireEvent.touchMove(card.parentElement!.parentElement!, {
      touches: [{ clientX: 50, clientY: 100 }],
    });

    // Click during swipe should not trigger onClick
    fireEvent.click(card);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
