import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
  it('renders skeleton component', () => {
    const { container } = render(<Skeleton />);
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-primary/10');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="w-full h-4" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-primary/10');
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('h-4');
  });

  it('merges custom className with default classes', () => {
    const { container } = render(
      <Skeleton className="bg-secondary border-2" />
    );
    const skeleton = container.firstChild as HTMLElement;

    // Should have both default and custom classes
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-secondary');
    expect(skeleton).toHaveClass('border-2');
  });

  it('renders as a div element', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;

    expect(skeleton?.nodeName).toBe('DIV');
  });

  it('forwards additional props', () => {
    const { container } = render(
      <Skeleton
        data-testid="skeleton-test"
        id="skeleton-id"
        aria-label="Loading content"
      />
    );

    const skeleton = screen.getByTestId('skeleton-test');
    expect(skeleton).toHaveAttribute('id', 'skeleton-id');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('handles onClick events', () => {
    const handleClick = jest.fn();
    const { container } = render(<Skeleton onClick={handleClick} />);
    const skeleton = container.firstChild as HTMLElement;

    skeleton.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('accepts style prop', () => {
    const { container } = render(
      <Skeleton style={{ width: '200px', height: '20px' }} />
    );
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '20px',
    });
  });

  it('accepts role attribute', () => {
    const { container } = render(<Skeleton role="status" />);
    const skeleton = screen.getByRole('status');

    expect(skeleton).toBeInTheDocument();
  });

  it('can be used with aria-busy for accessibility', () => {
    const { container } = render(<Skeleton aria-busy="true" aria-live="polite" />);
    const skeleton = document.querySelector('[aria-busy="true"]');

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
  });

  it('renders children when provided', () => {
    const { container } = render(
      <Skeleton>
        <span>Loading...</span>
      </Skeleton>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('maintains className order for style overrides', () => {
    const { container } = render(
      <Skeleton className="bg-blue-500 animate-none" />
    );
    const skeleton = container.firstChild as HTMLElement;

    // Custom classes should be able to override defaults
    expect(skeleton).toHaveClass('bg-blue-500');
    expect(skeleton).toHaveClass('animate-none');
  });

  it('works with Tailwind arbitrary values', () => {
    const { container } = render(<Skeleton className="w-[250px] h-[1.5rem]" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('w-[250px]');
    expect(skeleton).toHaveClass('h-[1.5rem]');
  });

  it('can be used for different skeleton types', () => {
    // Text skeleton
    const { container: textContainer } = render(
      <Skeleton className="h-4 w-[250px]" />
    );
    expect(textContainer.firstChild).toHaveClass('h-4', 'w-[250px]');

    // Avatar skeleton
    const { container: avatarContainer } = render(
      <Skeleton className="h-12 w-12 rounded-full" />
    );
    expect(avatarContainer.firstChild).toHaveClass(
      'h-12',
      'w-12',
      'rounded-full'
    );

    // Card skeleton
    const { container: cardContainer } = render(
      <Skeleton className="h-[125px] w-full rounded-xl" />
    );
    expect(cardContainer.firstChild).toHaveClass(
      'h-[125px]',
      'w-full',
      'rounded-xl'
    );
  });

  it('handles empty className gracefully', () => {
    const { container } = render(<Skeleton className="" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-primary/10');
  });

  it('handles undefined className', () => {
    const { container } = render(<Skeleton className={undefined} />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-primary/10');
  });

  it('supports data attributes for testing', () => {
    const { container } = render(<Skeleton data-test="skeleton" data-loading="true" />);

    const skeleton = document.querySelector('[data-test="skeleton"]');
    expect(skeleton).toHaveAttribute('data-loading', 'true');
  });

  it('can be composed with other components', () => {
    const ComposedComponent = () => (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );

    const { container } = render(<ComposedComponent />);
    const skeletons = container.querySelectorAll('.animate-pulse');

    expect(skeletons).toHaveLength(3);
  });

  it('maintains consistent rendering', () => {
    const { container: container1 } = render(
      <Skeleton className="test-class" />
    );
    const { container: container2 } = render(
      <Skeleton className="test-class" />
    );

    expect(container1.innerHTML).toBe(container2.innerHTML);
  });

  it('handles all HTML div attributes', () => {
    const { container } = render(
      <Skeleton title="Skeleton loader" tabIndex={-1} dir="ltr" lang="en" />
    );
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveAttribute('title', 'Skeleton loader');
    expect(skeleton).toHaveAttribute('tabIndex', '-1');
    expect(skeleton).toHaveAttribute('dir', 'ltr');
    expect(skeleton).toHaveAttribute('lang', 'en');
  });
});
