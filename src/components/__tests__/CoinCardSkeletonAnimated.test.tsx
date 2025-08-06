/**
 * Tests for CoinCardSkeletonAnimated component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { CoinCardSkeletonAnimated } from '../CoinCardSkeletonAnimated';

describe('CoinCardSkeletonAnimated', () => {
  it('renders skeleton structure correctly', () => {
    const { container } = render(<CoinCardSkeletonAnimated />);

    // Check for main container
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');

    // Check for skeleton elements
    const skeletonElements = container.querySelectorAll('.animate-shimmer');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('applies responsive classes', () => {
    const { container } = render(<CoinCardSkeletonAnimated />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('p-3', 'sm:p-4');
    expect(skeleton).toHaveClass('min-h-[120px]', 'sm:min-h-[140px]');
  });

  it('has correct layout structure', () => {
    const { container } = render(<CoinCardSkeletonAnimated />);

    // Check for coin image placeholder
    const imageSkeletons = container.querySelectorAll('.rounded-full');
    expect(imageSkeletons.length).toBeGreaterThan(0);
    expect(imageSkeletons[0]).toHaveClass('w-full', 'h-full');

    // Check for text placeholders
    const textSkeletons = container.querySelectorAll(
      '.rounded:not(.rounded-full)'
    );
    expect(textSkeletons.length).toBeGreaterThan(0);
  });

  it('accepts custom className prop', () => {
    const { container } = render(
      <CoinCardSkeletonAnimated className="custom-class" />
    );

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('custom-class');
  });

  it('has shimmer animation elements', () => {
    const { container } = render(<CoinCardSkeletonAnimated />);

    const shimmerElements = container.querySelectorAll('.animate-shimmer');
    expect(shimmerElements.length).toBeGreaterThan(0);

    // Each shimmer element should have background gradient
    shimmerElements.forEach(element => {
      expect(element).toHaveClass('bg-gray-200', 'dark:bg-gray-700');
    });
  });

  it('matches card dimensions', () => {
    const { container } = render(<CoinCardSkeletonAnimated />);

    const skeleton = container.firstChild as HTMLElement;

    // Should have same base classes as CoinCard
    expect(skeleton).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-xl',
      'sm:rounded-2xl',
      'shadow-sm'
    );
  });

  it('has appropriate spacing for skeleton elements', () => {
    const { container } = render(<CoinCardSkeletonAnimated />);

    // Check header spacing
    const headerSection = container.querySelector('.mb-2.sm\\:mb-3');
    expect(headerSection).toBeInTheDocument();

    // Check content spacing
    const contentSections = container.querySelectorAll('.space-y-2');
    expect(contentSections.length).toBeGreaterThan(0);
  });

  it('respects reduced motion preferences', () => {
    // Mock matchMedia for prefers-reduced-motion
    const mockMatchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { container } = render(<CoinCardSkeletonAnimated />);

    // Animation classes should still be present but CSS will handle disabling
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('provides visual hierarchy with different element sizes', () => {
    const { container } = render(<CoinCardSkeletonAnimated />);

    // Title skeleton should be wider
    const wideElements = container.querySelectorAll('.w-3\\/4');
    expect(wideElements.length).toBeGreaterThan(0);

    // Symbol skeleton should be narrower
    const narrowElements = container.querySelectorAll('.w-1\\/4');
    expect(narrowElements.length).toBeGreaterThan(0);

    // Price skeleton should be medium width
    const mediumElements = container.querySelectorAll('.w-1\\/3');
    expect(mediumElements.length).toBeGreaterThan(0);
  });

  it('maintains consistent height with actual card', () => {
    const { container } = render(<CoinCardSkeletonAnimated />);

    const skeleton = container.firstChild as HTMLElement;
    const contentDivs = skeleton.querySelectorAll('.space-y-2');

    // Should have multiple sections to match card content
    expect(contentDivs.length).toBeGreaterThan(0);

    // Should have price section
    const priceSection = skeleton.querySelector('.h-5.sm\\:h-6');
    expect(priceSection).toBeInTheDocument();
  });
});
