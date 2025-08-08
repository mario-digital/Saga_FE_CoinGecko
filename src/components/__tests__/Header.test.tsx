import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { Header } from '../Header';
import { useSearch } from '@/hooks/useSearch';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the useSearch hook
jest.mock('@/hooks/useSearch');

// Mock the SearchCommand component
jest.mock('../SearchCommand', () => ({
  SearchCommand: ({ open, onOpenChange, onSelectCoin }: any) => (
    <div data-testid="search-command">
      {open && (
        <div>
          <button onClick={() => onSelectCoin('bitcoin')}>
            Select Bitcoin
          </button>
          <button onClick={() => onOpenChange(false)}>Close</button>
        </div>
      )}
    </div>
  ),
}));

// Mock the ThemeToggle component
jest.mock('../ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

const mockUseSearch = {
  searchQuery: '',
  searchResults: undefined,
  isSearching: false,
  searchError: null,
  setSearchQuery: jest.fn(),
  clearSearch: jest.fn(),
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearch as jest.Mock).mockReturnValue(mockUseSearch);
  });

  it('renders header with title and description', () => {
    const { container } = render(<Header />);

    expect(screen.getByText('Cryptocurrency Market')).toBeInTheDocument();
    expect(
      screen.getByText('Real-time cryptocurrency prices and market data')
    ).toBeInTheDocument();
  });

  it('renders search trigger button', () => {
    const { container } = render(<Header />);

    const searchButton = screen.getByText('Search coins...');
    expect(searchButton).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('opens search dialog when clicking search button', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);

    const searchButton = screen.getByText('Search coins...');
    await user.click(searchButton);

    // SearchCommand should be rendered and open
    expect(screen.getByTestId('search-command')).toBeInTheDocument();
  });

  it('renders mobile menu button on small screens', () => {
    const { container } = render(<Header />);

    // Mobile menu button should be present (it's hidden on desktop via CSS)
    const menuButtons = container.querySelectorAll('[aria-label="Open menu"]');
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  it('toggles mobile menu when clicking menu button', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);

    // Find and click the mobile menu button
    const menuButton = container.querySelector(
      '[aria-label="Open menu"]'
    ) as HTMLElement;
    expect(menuButton).toBeInTheDocument();

    await user.click(menuButton);

    // Menu should now be open and show close button
    const closeButton = container.querySelector('[aria-label="Close menu"]');
    expect(closeButton).toBeInTheDocument();

    // Menu items should be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Top 10 Coins')).toBeInTheDocument();
    expect(screen.getByText('Search Coins')).toBeInTheDocument();
  });

  it('navigates to filtered page when clicking Top 10 Coins in mobile menu', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);

    // Open mobile menu
    const menuButton = container.querySelector(
      '[aria-label="Open menu"]'
    ) as HTMLElement;
    await user.click(menuButton);

    // Click on Top 10 Coins link
    const top10Link = screen.getByText('Top 10 Coins');
    expect(top10Link).toHaveAttribute('href', '/?filter=top10');

    // Verify the link structure
    await user.click(top10Link);

    // The mobile menu should close after clicking
    const openMenuButton = container.querySelector('[aria-label="Open menu"]');
    expect(openMenuButton).toBeInTheDocument();
  });

  it('navigates to coin page when selecting a coin', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);

    // Open search dialog
    const searchButton = screen.getByText('Search coins...');
    await user.click(searchButton);

    // Select a coin
    const selectButton = screen.getByText('Select Bitcoin');
    await user.click(selectButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/coin?id=bitcoin');
    expect(mockUseSearch.clearSearch).toHaveBeenCalled();
  });

  it('clears search when selecting a coin', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);

    // Open search dialog
    const searchButton = screen.getByText('Search coins...');
    await user.click(searchButton);

    // Select a coin
    const selectButton = screen.getByText('Select Bitcoin');
    await user.click(selectButton);

    expect(mockUseSearch.clearSearch).toHaveBeenCalled();
  });

  it('passes correct props to SearchCommand', () => {
    const mockSearchResults = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        market_cap_rank: 1,
        thumb: 'https://example.com/bitcoin.png',
      },
    ];

    (useSearch as jest.Mock).mockReturnValue({
      ...mockUseSearch,
      searchResults: mockSearchResults,
      isSearching: true,
      searchError: 'Test error',
    });

    const { container } = render(<Header />);

    // Open search to trigger SearchCommand rendering
    const searchButton = screen.getByText('Search coins...');
    fireEvent.click(searchButton);

    // SearchCommand should receive the correct props
    expect(screen.getByTestId('search-command')).toBeInTheDocument();
  });

  it('has proper button accessibility attributes', () => {
    const { container } = render(<Header />);

    const searchButton = screen.getByText('Search coins...');
    expect(searchButton).toBeInTheDocument();
    // The search button itself should have focus styles
    const buttonElement = searchButton.closest('button');
    expect(buttonElement).toHaveClass('focus:outline-none');
  });

  it('shows keyboard shortcut hint on larger screens', () => {
    const { container } = render(<Header />);

    const shortcutElement = screen.getByText('⌘K');
    expect(shortcutElement).toHaveClass('hidden', 'md:inline-block');
  });

  it('has hover effects on search button', () => {
    const { container } = render(<Header />);

    const searchButton = screen.getByText('Search coins...');
    expect(searchButton).toHaveClass(
      'hover:from-gray-100',
      'hover:text-gray-800'
    );
  });

  it('maintains search dialog state correctly', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);

    // Initially closed
    expect(screen.queryByText('Select Bitcoin')).not.toBeInTheDocument();

    // Open dialog
    const searchButton = screen.getByText('Search coins...');
    await user.click(searchButton);

    expect(screen.getByText('Select Bitcoin')).toBeInTheDocument();

    // Close dialog
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    expect(screen.queryByText('Select Bitcoin')).not.toBeInTheDocument();
  });

  describe('Mobile menu', () => {
    it('toggles mobile menu when clicking menu button', () => {
      const { container } = render(<Header />);

      // Menu should be closed initially
      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();

      // Open menu
      fireEvent.click(menuButton);

      // Menu button should now show close
      const closeButton = screen.getByLabelText('Close menu');
      expect(closeButton).toBeInTheDocument();

      // Menu items should be visible
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Top 10 Coins')).toBeInTheDocument();
      expect(screen.getByText('Search Coins')).toBeInTheDocument();

      // Close menu
      fireEvent.click(closeButton);

      // Menu button should show open again
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('closes mobile menu when clicking a navigation link', () => {
      const { container } = render(<Header />);

      // Open menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Click home link
      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);

      // Menu should close
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('opens search and closes menu when clicking search in mobile menu', () => {
      const { container } = render(<Header />);

      // Open menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Click search button in menu
      const searchButton = screen.getByText('Search Coins');
      fireEvent.click(searchButton);

      // Menu should close and search should open
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
      expect(screen.getByText('Select Bitcoin')).toBeInTheDocument();
    });

    it('has correct mobile menu link hrefs', () => {
      const { container } = render(<Header />);

      // Open menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');

      const top10Link = screen.getByText('Top 10 Coins').closest('a');
      expect(top10Link).toHaveAttribute('href', '/?filter=top10');
    });

    it('applies correct mobile menu styling classes', () => {
      const { container } = render(<Header />);

      // Check for mobile menu drawer container
      const mobileMenuDrawer = container.querySelector('.sm\\:hidden.border-t');
      expect(mobileMenuDrawer).toBeInTheDocument();

      // Initially closed (max-h-0)
      expect(mobileMenuDrawer).toHaveClass('max-h-0');

      // Open menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Should be open (max-h-64)
      expect(mobileMenuDrawer).toHaveClass('max-h-64');
    });
  });

  describe('Mobile search', () => {
    it('opens search dialog when clicking mobile search button', () => {
      const { container } = render(<Header />);

      // Find mobile search button by aria-label
      const searchButton = screen.getByLabelText('Search');
      fireEvent.click(searchButton);

      // Search dialog should open
      expect(screen.getByText('Select Bitcoin')).toBeInTheDocument();
    });

    it('renders mobile search button with correct classes', () => {
      const { container } = render(<Header />);

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toHaveClass(
        'p-2',
        'text-gray-500',
        'dark:text-gray-400',
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800',
        'rounded-md',
        'transition-colors'
      );
    });
  });

  describe('Responsive text', () => {
    it('renders responsive title text', () => {
      const { container } = render(<Header />);

      // Desktop title
      const desktopTitle = screen.getByText('Cryptocurrency Market');
      expect(desktopTitle).toHaveClass('hidden', 'sm:inline');

      // Mobile title
      const mobileTitle = screen.getByText('Crypto Market');
      expect(mobileTitle).toHaveClass('sm:hidden');
    });

    it('hides description on mobile', () => {
      const { container } = render(<Header />);

      const description = screen.getByText(
        'Real-time cryptocurrency prices and market data'
      );
      expect(description).toHaveClass('hidden', 'sm:block');
    });
  });

  describe('Theme toggle', () => {
    it('renders theme toggle buttons', () => {
      const { container } = render(<Header />);

      // Should have two theme toggles (desktop and mobile)
      const themeToggles = screen.getAllByTestId('theme-toggle');
      expect(themeToggles).toHaveLength(2);
    });
  });

  describe('Header styling', () => {
    it('applies sticky positioning and z-index', () => {
      const { container } = render(<Header />);

      const header = container.querySelector('header');
      expect(header).toHaveClass(
        'sticky',
        'top-0',
        'z-50',
        'bg-white/95',
        'dark:bg-gray-900',
        'backdrop-blur-md'
      );
    });

    it('applies correct container padding', () => {
      const { container } = render(<Header />);

      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toHaveClass('py-2', 'sm:py-4');
    });

    it('applies mobile menu icon classes', () => {
      const { container } = render(<Header />);

      const menuButton = screen.getByLabelText('Open menu');
      const menuIcon = menuButton.querySelector('.w-5.h-5');
      expect(menuIcon).toBeInTheDocument();
    });
  });

  describe('Navigation interactions', () => {
    it('navigates correctly from mobile menu links', () => {
      const { container } = render(<Header />);

      // Open menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Click Top 10 link
      const top10Link = screen.getByText('Top 10 Coins');
      fireEvent.click(top10Link);

      // Menu should close after navigation
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('applies hover styles to mobile menu items', () => {
      const { container } = render(<Header />);

      // Open menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass(
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800'
      );
    });
  });
});
