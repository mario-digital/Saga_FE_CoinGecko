import React from 'react';
import { render } from '@testing-library/react';
import { CoinDetailSkeleton } from '../CoinDetailSkeleton';

// Mock the Skeleton component
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  ),
}));

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={`Card ${className}`}>{children}</div>
  ),
  CardContent: ({ children }: any) => (
    <div className="CardContent">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div className="CardHeader">{children}</div>
  ),
}));

describe('CoinDetailSkeleton', () => {
  it('renders skeleton loader structure', () => {
    const { container } = render(<CoinDetailSkeleton />);

    // Check for animate-pulse elements
    const skeletonElements = container.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders header skeleton', () => {
    const { container } = render(<CoinDetailSkeleton />);

    // Header should have circular avatar skeleton
    const avatar = container.querySelector('.w-16.h-16.rounded-full');
    expect(avatar).toBeInTheDocument();
  });

  it('renders content skeleton blocks', () => {
    const { container } = render(<CoinDetailSkeleton />);

    // Should have multiple skeleton blocks for stats cards
    const cards = container.querySelectorAll('[class*="Card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('applies correct container classes', () => {
    const { container } = render(<CoinDetailSkeleton />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });

  it('renders price chart skeleton', () => {
    const { container } = render(<CoinDetailSkeleton />);

    // Should have price change grid skeleton
    const priceGrid = container.querySelector('.grid-cols-2.md\\:grid-cols-4');
    expect(priceGrid).toBeInTheDocument();
  });

  it('applies dark mode classes', () => {
    const { container } = render(<CoinDetailSkeleton />);

    const skeletons = container.querySelectorAll('.bg-gray-200');
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('dark:bg-gray-700');
    });
  });

  it('renders with proper spacing', () => {
    const { container } = render(<CoinDetailSkeleton />);

    const spacedElements = container.querySelectorAll('.space-y-2');
    expect(spacedElements.length).toBeGreaterThan(0);
  });

  it('renders rounded corners on skeleton elements', () => {
    const { container } = render(<CoinDetailSkeleton />);

    const roundedElements = container.querySelectorAll('.rounded-full');
    expect(roundedElements.length).toBeGreaterThan(0);
  });
});
