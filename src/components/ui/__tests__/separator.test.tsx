import React from 'react';
import { render } from '@testing-library/react';
import { Separator } from '../separator';

// Mock @radix-ui/react-separator
jest.mock('@radix-ui/react-separator', () => {
  const Root = React.forwardRef(
    (
      { className, orientation = 'horizontal', decorative, ...props }: any,
      ref: any
    ) => (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={orientation}
        className={className}
        {...props}
      />
    )
  );
  Root.displayName = 'Separator.Root';
  return { Root };
});

describe('Separator', () => {
  it('renders separator element', () => {
    const { container } = render(<Separator />);

    const separator = container.querySelector('[role="none"]');
    expect(separator).toBeInTheDocument();
  });

  it('applies horizontal orientation by default', () => {
    const { container } = render(<Separator />);

    const separator = container.querySelector(
      '[aria-orientation="horizontal"]'
    );
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-[1px]', 'w-full');
  });

  it('applies vertical orientation when specified', () => {
    const { container } = render(<Separator orientation="vertical" />);

    const separator = container.querySelector('[aria-orientation="vertical"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-full', 'w-[1px]');
  });

  it('applies custom className', () => {
    const { container } = render(<Separator className="custom-separator" />);

    const separator = container.querySelector('[role="none"]');
    expect(separator).toHaveClass('custom-separator');
  });

  it('applies default styling classes', () => {
    const { container } = render(<Separator />);

    const separator = container.querySelector('[role="none"]');
    expect(separator).toHaveClass('shrink-0', 'bg-border');
  });

  it('handles decorative prop', () => {
    const { container } = render(<Separator decorative />);

    const separator = container.querySelector('[role="none"]');
    expect(separator).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('accepts data attributes', () => {
    const { container } = render(<Separator data-testid="test-separator" />);

    const separator = container.querySelector('[data-testid="test-separator"]');
    expect(separator).toBeInTheDocument();
  });

  it('combines custom className with default classes', () => {
    const { container } = render(<Separator className="my-custom-class" />);

    const separator = container.querySelector('[role="none"]');
    expect(separator).toHaveClass('shrink-0', 'bg-border', 'my-custom-class');
  });

  it('renders with correct dimensions for horizontal', () => {
    const { container } = render(<Separator orientation="horizontal" />);

    const separator = container.querySelector('[role="none"]');
    expect(separator).toHaveClass('h-[1px]', 'w-full');
    expect(separator).not.toHaveClass('h-full', 'w-[1px]');
  });

  it('renders with correct dimensions for vertical', () => {
    const { container } = render(<Separator orientation="vertical" />);

    const separator = container.querySelector('[role="none"]');
    expect(separator).toHaveClass('h-full', 'w-[1px]');
    expect(separator).not.toHaveClass('h-[1px]', 'w-full');
  });
});
