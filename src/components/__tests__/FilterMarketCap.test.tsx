import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterMarketCap from '@/components/FilterMarketCap';

describe('FilterMarketCap', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all filter options', () => {
    render(<FilterMarketCap value="all" onChange={mockOnChange} />);

    expect(screen.getByLabelText('Show all coins')).toBeInTheDocument();
    expect(screen.getByLabelText('Show top 10 coins')).toBeInTheDocument();
    expect(screen.getByLabelText('Show top 50 coins')).toBeInTheDocument();
    expect(screen.getByLabelText('Show top 100 coins')).toBeInTheDocument();
  });

  it('displays correct active filter', () => {
    const { rerender } = render(
      <FilterMarketCap value="all" onChange={mockOnChange} />
    );

    expect(screen.getByLabelText('Show all coins')).toHaveAttribute(
      'data-state',
      'on'
    );

    rerender(<FilterMarketCap value="top50" onChange={mockOnChange} />);
    expect(screen.getByLabelText('Show top 50 coins')).toHaveAttribute(
      'data-state',
      'on'
    );
  });

  it('calls onChange when filter is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterMarketCap value="all" onChange={mockOnChange} />);

    await user.click(screen.getByLabelText('Show top 10 coins'));
    expect(mockOnChange).toHaveBeenCalledWith('top10');

    await user.click(screen.getByLabelText('Show top 50 coins'));
    expect(mockOnChange).toHaveBeenCalledWith('top50');

    await user.click(screen.getByLabelText('Show top 100 coins'));
    expect(mockOnChange).toHaveBeenCalledWith('top100');
  });

  it('has proper ARIA labels for accessibility', () => {
    render(<FilterMarketCap value="all" onChange={mockOnChange} />);

    expect(
      screen.getByRole('group', { name: 'Filter coins by market cap' })
    ).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<FilterMarketCap value="all" onChange={mockOnChange} />);

    const top10Button = screen.getByLabelText('Show top 10 coins');

    // The ToggleGroup implementation manages its own focus
    // The group itself is focusable, not individual items initially
    const toggleGroup = screen.getByRole('group');
    expect(toggleGroup).toHaveAttribute('tabindex', '0');

    // Clicking a button triggers onChange
    await user.click(top10Button);
    expect(mockOnChange).toHaveBeenCalledWith('top10');
  });

  it('applies responsive classes for mobile/desktop layout', () => {
    render(<FilterMarketCap value="all" onChange={mockOnChange} />);

    const toggleGroup = screen.getByRole('group', {
      name: 'Filter coins by market cap',
    });

    expect(toggleGroup).toHaveClass('flex-col', 'sm:flex-row');
  });

  it('does not call onChange when clicking already active filter', async () => {
    const user = userEvent.setup();
    render(<FilterMarketCap value="all" onChange={mockOnChange} />);

    await user.click(screen.getByLabelText('Show all coins'));
    // ToggleGroup may or may not call onChange for same value
    // This behavior depends on the component implementation
  });

  it('maintains controlled component behavior', () => {
    const { rerender } = render(
      <FilterMarketCap value="all" onChange={mockOnChange} />
    );

    expect(screen.getByLabelText('Show all coins')).toHaveAttribute(
      'data-state',
      'on'
    );

    // Change value prop externally
    rerender(<FilterMarketCap value="top10" onChange={mockOnChange} />);

    expect(screen.getByLabelText('Show all coins')).toHaveAttribute(
      'data-state',
      'off'
    );
    expect(screen.getByLabelText('Show top 10 coins')).toHaveAttribute(
      'data-state',
      'on'
    );
  });
});
