import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptimizedImage } from '../OptimizedImage';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({
    priority,
    placeholder,
    blurDataURL,
    loader,
    quality,
    onLoad,
    onError,
    alt = '',
    ...props
  }: any) {
    // Filter out Next.js specific props that shouldn't be on img element
    const imgProps = { ...props, alt };
    // Handle onLoad and onError if needed
    if (onLoad) imgProps.onLoad = onLoad;
    if (onError) imgProps.onError = onError;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

describe('OptimizedImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.png',
    alt: 'Test image',
    width: 100,
    height: 100,
  };

  it('renders image with correct props', () => {
    const { container } = render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.png');
    expect(image).toHaveAttribute('width', '100');
    expect(image).toHaveAttribute('height', '100');
  });

  it('shows loading state initially', () => {
    const { container } = render(<OptimizedImage {...defaultProps} />);

    const loadingDiv = container.querySelector('.animate-pulse');
    expect(loadingDiv).toBeInTheDocument();
    expect(loadingDiv).toHaveClass('bg-gray-200', 'dark:bg-gray-700');
  });

  it('removes loading state after image loads', async () => {
    const { container } = render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByAltText('Test image');
    fireEvent.load(image);

    await waitFor(() => {
      const loadingDiv = container.querySelector('.animate-pulse');
      expect(loadingDiv).not.toBeInTheDocument();
    });

    expect(image).toHaveClass('opacity-100');
  });

  it('shows error placeholder when image fails to load', () => {
    const onError = jest.fn();
    const { container } = render(<OptimizedImage {...defaultProps} onError={onError} />);

    const image = screen.getByAltText('Test image');
    fireEvent.error(image);

    expect(screen.getByText('IMG')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <OptimizedImage {...defaultProps} className="custom-class" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('sets priority loading when priority prop is true', () => {
    const { container } = render(<OptimizedImage {...defaultProps} priority={true} />);

    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('loading', 'eager');
    // Priority is an internal Next.js prop, not an HTML attribute
  });

  it('sets lazy loading when priority prop is false', () => {
    const { container } = render(<OptimizedImage {...defaultProps} priority={false} />);

    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('passes sizes prop to Image component', () => {
    const sizes = '(max-width: 768px) 100vw, 50vw';
    const { container } = render(<OptimizedImage {...defaultProps} sizes={sizes} />);

    const image = screen.getByAltText('Test image');
    expect(image).toHaveAttribute('sizes', sizes);
  });

  it('applies correct dimensions to wrapper', () => {
    const { container } = render(
      <OptimizedImage {...defaultProps} width={200} height={150} />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '200px', height: '150px' });
  });

  it('shows error placeholder with correct dimensions', () => {
    const { container } = render(<OptimizedImage {...defaultProps} width={200} height={150} />);

    const image = screen.getByAltText('Test image');
    fireEvent.error(image);

    const errorPlaceholder = screen.getByText('IMG').parentElement;
    expect(errorPlaceholder).toHaveStyle({ width: '200px', height: '150px' });
  });

  it('handles missing onError callback gracefully', () => {
    const { container } = render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByAltText('Test image');

    // Should not throw error when onError is not provided
    expect(() => fireEvent.error(image)).not.toThrow();
    expect(screen.getByText('IMG')).toBeInTheDocument();
  });

  it('applies opacity transition classes', () => {
    const { container } = render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByAltText('Test image');
    expect(image).toHaveClass('transition-opacity', 'duration-300');

    // Initially opacity-0 while loading
    expect(image).toHaveClass('opacity-0');

    // After load, opacity-100
    fireEvent.load(image);
    expect(image).toHaveClass('opacity-100');
  });

  it('maintains error state after being set', () => {
    const { rerender } = render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByAltText('Test image');
    fireEvent.error(image);

    expect(screen.getByText('IMG')).toBeInTheDocument();

    // Rerender with new props
    rerender(<OptimizedImage {...defaultProps} alt="Updated alt" />);

    // Should still show error placeholder
    expect(screen.getByText('IMG')).toBeInTheDocument();
    expect(screen.queryByAltText('Updated alt')).not.toBeInTheDocument();
  });

  it('applies dark mode classes to loading state', () => {
    const { container } = render(<OptimizedImage {...defaultProps} />);

    const loadingDiv = container.querySelector('.animate-pulse');
    expect(loadingDiv).toHaveClass('dark:bg-gray-700');
  });

  it('applies dark mode classes to error state', () => {
    const { container } = render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByAltText('Test image');
    fireEvent.error(image);

    const errorPlaceholder = screen.getByText('IMG').parentElement;
    expect(errorPlaceholder).toHaveClass('dark:bg-gray-700');
  });
});
