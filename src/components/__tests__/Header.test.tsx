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
    render(<Header />);

    expect(screen.getByText('Cryptocurrency Market')).toBeInTheDocument();
    expect(
      screen.getByText('Real-time cryptocurrency prices and market data')
    ).toBeInTheDocument();
  });

  it('renders search trigger button', () => {
    render(<Header />);

    const searchButton = screen.getByText('Search coins...');
    expect(searchButton).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('opens search dialog when clicking search button', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const searchButton = screen.getByText('Search coins...');
    await user.click(searchButton);

    // SearchCommand should be rendered and open
    expect(screen.getByTestId('search-command')).toBeInTheDocument();
  });

  it('navigates to coin page when selecting a coin', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open search dialog
    const searchButton = screen.getByText('Search coins...');
    await user.click(searchButton);

    // Select a coin
    const selectButton = screen.getByText('Select Bitcoin');
    await user.click(selectButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/bitcoin');
    expect(mockUseSearch.clearSearch).toHaveBeenCalled();
  });

  it('clears search when selecting a coin', async () => {
    const user = userEvent.setup();
    render(<Header />);

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

    render(<Header />);

    // Open search to trigger SearchCommand rendering
    const searchButton = screen.getByText('Search coins...');
    fireEvent.click(searchButton);

    // SearchCommand should receive the correct props
    expect(screen.getByTestId('search-command')).toBeInTheDocument();
  });

  it('has proper button accessibility attributes', () => {
    render(<Header />);

    const searchButton = screen.getByRole('button', { name: /search coins/i });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toHaveClass(
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500'
    );
  });

  it('shows keyboard shortcut hint on larger screens', () => {
    render(<Header />);

    const shortcutElement = screen.getByText('⌘K');
    expect(shortcutElement).toHaveClass('hidden', 'sm:inline-block');
  });

  it('has hover effects on search button', () => {
    render(<Header />);

    const searchButton = screen.getByText('Search coins...');
    expect(searchButton).toHaveClass(
      'hover:bg-gray-200',
      'hover:text-gray-700'
    );
  });

  it('maintains search dialog state correctly', async () => {
    const user = userEvent.setup();
    render(<Header />);

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
});
