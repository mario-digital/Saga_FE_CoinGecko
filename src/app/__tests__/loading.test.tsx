import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../loading';

describe('Loading', () => {
  it('renders loading skeleton cards', () => {
    const { container } = render(<Loading />);

    // Should render 12 skeleton cards
    const skeletonCards = container.querySelectorAll('.animate-pulse');
    expect(skeletonCards).toHaveLength(12);
  });

  it('applies correct grid layout classes', () => {
    const { container } = render(<Loading />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4'
    );
  });

  it('applies correct container classes', () => {
    const { container } = render(<Loading />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      'max-w-7xl',
      'mx-auto',
      'px-3',
      'sm:px-4',
      'lg:px-6',
      'py-4',
      'sm:py-6',
      'lg:py-8'
    );
  });

  it('renders skeleton cards with correct structure', () => {
    const { container } = render(<Loading />);

    const firstCard = container.querySelector('.animate-pulse');

    // Check for avatar skeleton
    const avatarSkeleton = firstCard?.querySelector('.rounded-full');
    expect(avatarSkeleton).toBeInTheDocument();
    expect(avatarSkeleton).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12');

    // Check for text skeletons
    const textSkeletons = firstCard?.querySelectorAll(
      '.rounded:not(.rounded-full)'
    );
    expect(textSkeletons?.length).toBeGreaterThan(0);
  });

  it('applies dark mode classes', () => {
    const { container } = render(<Loading />);

    const cards = container.querySelectorAll('.animate-pulse');
    cards.forEach(card => {
      expect(card).toHaveClass('dark:bg-gray-800');
    });

    const skeletonElements = container.querySelectorAll('.bg-gray-200');
    skeletonElements.forEach(element => {
      expect(element).toHaveClass('dark:bg-gray-700');
    });
  });

  it('applies responsive gap classes to grid', () => {
    const { container } = render(<Loading />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('gap-3', 'sm:gap-4', 'lg:gap-5');
  });

  it('applies correct card styling', () => {
    const { container } = render(<Loading />);

    const cards = container.querySelectorAll('.animate-pulse');
    cards.forEach(card => {
      expect(card).toHaveClass(
        'bg-white',
        'rounded-xl',
        'sm:rounded-2xl',
        'shadow-sm',
        'p-3',
        'sm:p-4',
        'min-h-[120px]',
        'sm:min-h-[140px]'
      );
    });
  });

  it('renders consistent skeleton layout for each card', () => {
    const { container } = render(<Loading />);

    const cards = container.querySelectorAll('.animate-pulse');

    cards.forEach(card => {
      // Each card should have a header section with avatar
      const headerSection = card.querySelector('.flex.items-center.space-x-3');
      expect(headerSection).toBeInTheDocument();

      // Each card should have a content section
      const contentSection = card.querySelector('.space-y-2');
      expect(contentSection).toBeInTheDocument();

      // Content section should have multiple skeleton lines
      const contentLines = contentSection?.querySelectorAll('.rounded');
      expect(contentLines?.length).toBe(3);
    });
  });

  it('applies different widths to skeleton lines for variety', () => {
    const { container } = render(<Loading />);

    const firstCard = container.querySelector('.animate-pulse');
    const skeletonLines = firstCard?.querySelectorAll(
      '.rounded:not(.rounded-full)'
    );

    // Check for varied widths
    const widths = Array.from(skeletonLines || []).map(line => {
      if (line.classList.contains('w-3/4')) return '75%';
      if (line.classList.contains('w-1/4')) return '25%';
      if (line.classList.contains('w-1/2')) return '50%';
      if (line.classList.contains('w-2/3')) return '66%';
      return 'unknown';
    });

    // Should have different widths for visual variety
    const uniqueWidths = new Set(widths);
    expect(uniqueWidths.size).toBeGreaterThan(1);
  });

  it('maintains consistent spacing between skeleton elements', () => {
    const { container } = render(<Loading />);

    const firstCard = container.querySelector('.animate-pulse');

    // Check margin bottom on header
    const header = firstCard?.querySelector('.flex.items-center');
    expect(header).toHaveClass('mb-3');

    // Check spacing in header
    expect(header).toHaveClass('space-x-3');

    // Check spacing in content section
    const contentSection = firstCard?.querySelector('.space-y-2');
    expect(contentSection).toHaveClass('space-y-2');
  });

  it('renders exactly 12 skeleton cards', () => {
    const { container } = render(<Loading />);

    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards).toHaveLength(12);

    // Verify each has a unique key (implicitly tested by React not warning)
    cards.forEach((card, index) => {
      expect(card).toBeInTheDocument();
    });
  });

  it('skeleton heights match expected values', () => {
    const { container } = render(<Loading />);

    const firstCard = container.querySelector('.animate-pulse');

    // Title skeleton
    const titleSkeleton = firstCard?.querySelector('.h-4');
    expect(titleSkeleton).toBeInTheDocument();

    // Subtitle skeleton
    const subtitleSkeleton = firstCard?.querySelector('.h-3');
    expect(subtitleSkeleton).toBeInTheDocument();

    // Price skeleton (larger)
    const priceSkeleton = firstCard?.querySelector('.h-5');
    expect(priceSkeleton).toBeInTheDocument();
  });
});
