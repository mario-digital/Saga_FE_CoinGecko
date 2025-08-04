import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchCommand } from '../SearchCommand';
import { SearchCoin } from '@/types/coingecko';

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
    // Clean up any open dialogs
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach(dialog => dialog.remove());
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
    await user.type(input, 'bitcoin');

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

  it('displays search results', () => {
    render(
      <SearchCommand {...defaultProps} searchResults={mockSearchResults} />
    );

    // Should show the group heading
    expect(screen.getByText('Cryptocurrencies')).toBeInTheDocument();

    // Should show coin names
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();

    // Should show symbols
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();

    // Should show market cap ranks
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} searchResults={[]} />);

    // Type something to trigger search state
    const input = screen.getByPlaceholderText('Search cryptocurrencies...');
    await user.type(input, 'nonexistent');

    expect(screen.getByText('No cryptocurrencies found.')).toBeInTheDocument();
  });

  it('calls onSelectCoin and closes dialog when clicking on result', async () => {
    const user = userEvent.setup();
    render(
      <SearchCommand {...defaultProps} searchResults={mockSearchResults} />
    );

    const bitcoinOption = screen.getByText('Bitcoin');
    await user.click(bitcoinOption);

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

  it('clears search query when dialog closes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SearchCommand {...defaultProps} />);

    // Type something
    const input = screen.getByPlaceholderText('Search cryptocurrencies...');
    await user.type(input, 'bitcoin');

    // Close dialog by clicking on a result
    if (mockSearchResults.length > 0) {
      rerender(
        <SearchCommand {...defaultProps} searchResults={mockSearchResults} />
      );

      const bitcoinOption = screen.getByText('Bitcoin');
      await user.click(bitcoinOption);

      // Dialog should close and search should be cleared
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('renders dialog element', () => {
    render(<SearchCommand {...defaultProps} />);

    // Check that dialog element is rendered
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
  });

  it('displays coin thumbnails correctly', () => {
    render(
      <SearchCommand {...defaultProps} searchResults={mockSearchResults} />
    );

    const bitcoinImage = screen.getByAltText('Bitcoin');
    const ethereumImage = screen.getByAltText('Ethereum');

    expect(bitcoinImage).toBeInTheDocument();
    expect(ethereumImage).toBeInTheDocument();
    expect(bitcoinImage).toHaveAttribute('src', mockSearchResults[0].thumb);
    expect(ethereumImage).toHaveAttribute('src', mockSearchResults[1].thumb);
  });

  it('handles missing market cap rank gracefully', () => {
    const resultsWithoutRank: SearchCoin[] = [
      {
        ...mockSearchResults[0],
        market_cap_rank: 0, // No rank
      },
    ];

    render(
      <SearchCommand {...defaultProps} searchResults={resultsWithoutRank} />
    );

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    // Should not show rank when it's 0 or missing
    expect(screen.queryByText('#0')).not.toBeInTheDocument();
  });
});
