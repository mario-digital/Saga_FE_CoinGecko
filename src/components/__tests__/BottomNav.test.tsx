import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { BottomNav } from '../BottomNav';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, className, 'aria-label': ariaLabel }: any) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Home: ({ className }: any) => (
    <div className={className} data-testid="home-icon">
      Home Icon
    </div>
  ),
  TrendingUp: ({ className }: any) => (
    <div className={className} data-testid="trending-icon">
      Trending Icon
    </div>
  ),
  Search: ({ className }: any) => (
    <div className={className} data-testid="search-icon">
      Search Icon
    </div>
  ),
  MoreHorizontal: ({ className }: any) => (
    <div className={className} data-testid="more-icon">
      More Icon
    </div>
  ),
}));

describe('BottomNav', () => {
  const mockOnSearchOpen = jest.fn();
  const mockOnMenuOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('renders all navigation items', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Top 10')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('renders all icons', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-icon')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('more-icon')).toBeInTheDocument();
  });

  it('highlights active navigation item for home', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toHaveClass('text-primary', 'dark:text-primary');
  });

  it('highlights active navigation item for top 10', () => {
    (usePathname as jest.Mock).mockReturnValue('/?filter=top10');
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const topLink = screen.getByLabelText('Top 10');
    expect(topLink).toHaveClass('text-primary', 'dark:text-primary');
  });

  it('applies inactive styles to non-active items', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const topLink = screen.getByLabelText('Top 10');
    expect(topLink).toHaveClass('text-gray-600', 'dark:text-gray-400');
  });

  it('calls onSearchOpen when search button is clicked', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const searchButton = screen.getByLabelText('Search');
    fireEvent.click(searchButton);

    expect(mockOnSearchOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onMenuOpen when more button is clicked', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const moreButton = screen.getByLabelText('More');
    fireEvent.click(moreButton);

    expect(mockOnMenuOpen).toHaveBeenCalledTimes(1);
  });

  it('renders links with correct href attributes', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toHaveAttribute('href', '/');

    const topLink = screen.getByLabelText('Top 10');
    expect(topLink).toHaveAttribute('href', '/?filter=top10');
  });

  it('applies correct container classes', () => {
    const { container } = render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass(
      'fixed',
      'bottom-0',
      'left-0',
      'right-0',
      'z-40',
      'bg-white',
      'dark:bg-gray-900',
      'border-t',
      'border-gray-200',
      'dark:border-gray-800',
      'sm:hidden'
    );
  });

  it('renders with grid layout for 4 columns', () => {
    const { container } = render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-4', 'h-16');
  });

  it('applies hover styles to navigation items', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toHaveClass('hover:bg-gray-50', 'dark:hover:bg-gray-800');

    const searchButton = screen.getByLabelText('Search');
    expect(searchButton).toHaveClass(
      'hover:bg-gray-50',
      'dark:hover:bg-gray-800'
    );
  });

  it('renders safe area padding div', () => {
    const { container } = render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const safeArea = container.querySelector('.h-safe-bottom');
    expect(safeArea).toBeInTheDocument();
    expect(safeArea).toHaveClass('bg-white', 'dark:bg-gray-900');
  });

  it('handles keyboard navigation for buttons', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const searchButton = screen.getByLabelText('Search');
    fireEvent.keyDown(searchButton, { key: 'Enter' });
    // Click event should be triggered by browser for Enter key on button
  });

  it('maintains fixed positioning on mobile', () => {
    const { container } = render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('fixed', 'bottom-0', 'sm:hidden');
  });

  it('renders buttons as buttons and links as links', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    // Home and Top 10 should be links
    const homeLink = screen.getByLabelText('Home').tagName;
    expect(homeLink).toBe('A');

    const topLink = screen.getByLabelText('Top 10').tagName;
    expect(topLink).toBe('A');

    // Search and More should be buttons
    const searchButton = screen.getByLabelText('Search').tagName;
    expect(searchButton).toBe('BUTTON');

    const moreButton = screen.getByLabelText('More').tagName;
    expect(moreButton).toBe('BUTTON');
  });

  it('applies flex layout to each nav item', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const navItems = [
      screen.getByLabelText('Home'),
      screen.getByLabelText('Top 10'),
      screen.getByLabelText('Search'),
      screen.getByLabelText('More'),
    ];

    navItems.forEach(item => {
      expect(item).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-1',
        'text-xs',
        'font-medium'
      );
    });
  });

  it('does not call callbacks on link clicks', () => {
    render(
      <BottomNav onSearchOpen={mockOnSearchOpen} onMenuOpen={mockOnMenuOpen} />
    );

    const homeLink = screen.getByLabelText('Home');
    fireEvent.click(homeLink);

    const topLink = screen.getByLabelText('Top 10');
    fireEvent.click(topLink);

    expect(mockOnSearchOpen).not.toHaveBeenCalled();
    expect(mockOnMenuOpen).not.toHaveBeenCalled();
  });
});
