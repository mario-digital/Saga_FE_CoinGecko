import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchCommand } from '../SearchCommand';
import { SearchCoin } from '@/types/coingecko';

// Mock the dialog portal to render in document body
jest.mock('@radix-ui/react-dialog', () => {
  const originalModule = jest.requireActual('@radix-ui/react-dialog');
  return {
    ...originalModule,
    Root: ({ children, onOpenChange, ...props }: any) => {
      // Filter out onOpenChange from being passed to DOM element
      return <div {...props}>{children}</div>;
    },
    Portal: ({ children }: any) => (
      <div data-testid="dialog-portal">{children}</div>
    ),
    Overlay: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Content: ({
      children,
      onOpenChange,
      onPointerDownOutside,
      onEscapeKeyDown,
      onInteractOutside,
      ...props
    }: any) => {
      // Filter out non-DOM props
      return (
        <div role="dialog" {...props}>
          {children}
        </div>
      );
    },
    Title: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    Trigger: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    Close: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  };
});

const mockSearchResults: SearchCoin[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    market_cap_rank: 1,
    thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    market_cap_rank: 2,
    thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
  },
];

describe('SearchCommand', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    searchResults: undefined,
    isSearching: false,
    searchError: null,
    onSearch: jest.fn(),
    onSelectCoin: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input when open', () => {
    render(<SearchCommand {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('Search cryptocurrencies...')
    ).toBeInTheDocument();
  });

  it('shows initial empty state message', () => {
    render(<SearchCommand {...defaultProps} />);

    expect(
      screen.getByText('Start typing to search cryptocurrencies...')
    ).toBeInTheDocument();
  });

  it('calls onSearch when typing in input', async () => {
    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search cryptocurrencies...');
    await act(async () => {
      await user.type(input, 'bitcoin');
    });

    expect(defaultProps.onSearch).toHaveBeenCalledWith('bitcoin');
  });

  it('shows loading state when searching', () => {
    render(<SearchCommand {...defaultProps} isSearching={true} />);

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('shows error message when search fails', () => {
    const errorMessage = 'Search failed. Please try again.';
    render(<SearchCommand {...defaultProps} searchError={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays search results when user types', async () => {
    const user = userEvent.setup();
    render(
      <SearchCommand {...defaultProps} searchResults={mockSearchResults} />
    );

    // Type something first to trigger display of results
    const input = screen.getByPlaceholderText('Search cryptocurrencies...');
    await act(async () => {
      await user.type(input, 'bitcoin');
    });

    // Should show the group heading
    expect(screen.getByText('Cryptocurrencies')).toBeInTheDocument();

    // Should show Bitcoin (first coin)
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();

    // Check that search results are rendered (at least one)
    const searchItems = screen.getAllByRole('option');
    expect(searchItems.length).toBeGreaterThan(0);
  });

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} searchResults={[]} />);

    // Type something to trigger search state
    const input = screen.getByPlaceholderText('Search cryptocurrencies...');
    await act(async () => {
      await user.type(input, 'nonexistent');
    });

    // Now the component should show "No results found" because we have a query and empty results
    expect(screen.getByText('No cryptocurrencies found.')).toBeInTheDocument();
  });

  it('calls onSelectCoin and closes dialog when clicking on result', async () => {
    const user = userEvent.setup();
    render(
      <SearchCommand {...defaultProps} searchResults={mockSearchResults} />
    );

    // Type something first to show results
    const input = screen.getByPlaceholderText('Search cryptocurrencies...');
    await act(async () => {
      await user.type(input, 'bitcoin');
    });

    const bitcoinOption = screen.getByText('Bitcoin');
    await act(async () => {
      await user.click(bitcoinOption);
    });

    expect(defaultProps.onSelectCoin).toHaveBeenCalledWith('bitcoin');
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles keyboard shortcuts', () => {
    const { rerender } = render(
      <SearchCommand {...defaultProps} open={false} />
    );

    // Simulate Cmd+K keypress
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(true);

    // Test with open dialog
    rerender(<SearchCommand {...defaultProps} open={true} />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles Ctrl+K shortcut on Windows/Linux', () => {
    render(<SearchCommand {...defaultProps} open={false} />);

    // Simulate Ctrl+K keypress
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(true);
  });

  it('displays coin thumbnails correctly', async () => {
    const user = userEvent.setup();
    render(
      <SearchCommand {...defaultProps} searchResults={mockSearchResults} />
    );

    // Type something first to trigger display of results
    const input = screen.getByPlaceholderText('Search cryptocurrencies...');
    await act(async () => {
      await user.type(input, 'bitcoin');
    });

    // Should show Bitcoin image
    const bitcoinImage = screen.getByAltText('Bitcoin');
    expect(bitcoinImage).toBeInTheDocument();
    expect(bitcoinImage).toHaveAttribute('src', mockSearchResults[0].thumb);

    // Check that images are rendered for search results
    const coinImages = screen.getAllByRole('img');
    expect(coinImages.length).toBeGreaterThan(0);
  });

  it('handles missing market cap rank gracefully', async () => {
    const user = userEvent.setup();
    const resultsWithoutRank: SearchCoin[] = [
      {
        ...mockSearchResults[0],
        market_cap_rank: 0, // No rank
      },
    ];

    render(
      <SearchCommand {...defaultProps} searchResults={resultsWithoutRank} />
    );

    // Need to type something first to see the results
    const input = screen.getByPlaceholderText('Search cryptocurrencies...');
    await act(async () => {
      await user.type(input, 'bitcoin');
    });

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    // Should not show rank when it's 0 or missing
    expect(screen.queryByText('#0')).not.toBeInTheDocument();
  });

  it('renders accessible dialog with title', () => {
    render(<SearchCommand {...defaultProps} />);

    // Check that dialog element is rendered
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();

    // Check that dialog has accessible title (even if visually hidden)
    expect(document.querySelector('.sr-only')).toHaveTextContent(
      'Search cryptocurrencies'
    );
  });
});
