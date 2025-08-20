import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CoinCardSkeleton } from '../CoinCardSkeleton';

describe('CoinCardSkeleton', () => {
  it('renders skeleton loading state', () => {
    const { container } = render(<CoinCardSkeleton />);

    // Check for animate-pulse class
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');

    // Check for skeleton structure
    expect(skeleton).toHaveClass('bg-white', 'dark:bg-gray-800', 'rounded-2xl');
  });

  it('applies custom className', () => {
    const { container } = render(<CoinCardSkeleton className="custom-class" />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('custom-class');
  });

  it('renders all skeleton elements', () => {
    const { container } = render(<CoinCardSkeleton />);

    // Check for avatar skeleton (coin image)
    const avatar = container.querySelector('.w-12.h-12.bg-gray-200');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('rounded-full');

    // Check for title skeletons (coin name and symbol)
    const titleSkeletons = container.querySelectorAll('.bg-gray-200.rounded');
    expect(titleSkeletons.length).toBeGreaterThan(0);
  });

  it('has correct dark mode classes', () => {
    const { container } = render(<CoinCardSkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('dark:bg-gray-800');
    expect(skeleton).toHaveClass('dark:border-gray-700');

    // Check dark mode for skeleton elements
    const skeletonElements = container.querySelectorAll('.dark\\:bg-gray-700');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders header section with coin info placeholder', () => {
    const { container } = render(<CoinCardSkeleton />);

    // Check for header structure
    const header = container.querySelector(
      '.flex.items-center.justify-between.mb-3'
    );
    expect(header).toBeInTheDocument();

    // Check for coin info section
    const coinInfo = container.querySelector('.flex.items-center.space-x-3');
    expect(coinInfo).toBeInTheDocument();
  });

  it('renders price and market data placeholders', () => {
    const { container } = render(<CoinCardSkeleton />);

    // Check for price section
    const priceSection = container.querySelector('.space-y-2');
    expect(priceSection).toBeInTheDocument();

    // Check for multiple data rows
    const dataRows = priceSection?.querySelectorAll(
      '.flex.items-center.justify-between'
    );
    expect(dataRows?.length).toBe(3); // Price, Market Cap, Volume
  });

  it('has correct styling for shadow and border', () => {
    const { container } = render(<CoinCardSkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('shadow-sm');
    expect(skeleton).toHaveClass('dark:shadow-none');
    expect(skeleton).toHaveClass('dark:border');
  });

  it('has correct padding', () => {
    const { container } = render(<CoinCardSkeleton />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('p-4');
  });

  it('renders rank badge placeholder', () => {
    const { container } = render(<CoinCardSkeleton />);

    // Look for the rank badge skeleton (rounded-full element in header)
    const rankBadge = container.querySelector(
      '.h-6.w-10.bg-gray-200.dark\\:bg-gray-700.rounded-full'
    );
    expect(rankBadge).toBeInTheDocument();
  });

  it('matches the structure of actual CoinCard', () => {
    const { container } = render(<CoinCardSkeleton />);

    // Should have similar structure to CoinCard
    // 1. Outer container with card styling
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-2xl');

    // 2. Header section
    const header = card.querySelector('.flex.items-center.justify-between');
    expect(header).toBeInTheDocument();

    // 3. Content section with market data
    const content = card.querySelector('.space-y-2');
    expect(content).toBeInTheDocument();
  });

  it('renders without accessibility violations', () => {
    const { container } = render(<CoinCardSkeleton />);

    // Skeleton should be presentational only
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.getAttribute('aria-hidden')).toBeNull();

    // No interactive elements should be present
    const buttons = skeleton.querySelectorAll('button');
    const links = skeleton.querySelectorAll('a');
    expect(buttons).toHaveLength(0);
    expect(links).toHaveLength(0);
  });

  it('maintains consistent dimensions for skeleton blocks', () => {
    const { container } = render(<CoinCardSkeleton />);

    // Check coin image placeholder dimensions
    const coinImage = container.querySelector('.w-12.h-12');
    expect(coinImage).toBeInTheDocument();

    // Check various text placeholder dimensions
    const namePlaceholder = container.querySelector('.h-5.w-24');
    expect(namePlaceholder).toBeInTheDocument();

    const symbolPlaceholder = container.querySelector('.h-4.w-16');
    expect(symbolPlaceholder).toBeInTheDocument();
  });
});
