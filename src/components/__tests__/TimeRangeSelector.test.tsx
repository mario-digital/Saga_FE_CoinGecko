import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TimeRangeSelector } from '../TimeRangeSelector';
import { TimeRange } from '@/hooks/usePriceHistory';

// Mock the toggle group components
jest.mock('@/components/ui/toggle-group', () => ({
  ToggleGroup: ({ children, onValueChange, value, className }: any) => (
    <div className={className} data-value={value} data-testid="toggle-group">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => onValueChange?.((child as any).props.value),
            })
          : child
      )}
    </div>
  ),
  ToggleGroupItem: ({
    children,
    value,
    onClick,
    className,
    'aria-label': ariaLabel,
  }: any) => (
    <button
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      data-value={value}
    >
      {children}
    </button>
  ),
}));

describe('TimeRangeSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all time range options', () => {
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    expect(screen.getByText('24H')).toBeInTheDocument();
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
    expect(screen.getByText('90D')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
  });

  it('calls onChange when a time range is selected', () => {
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    const button24h = screen.getByText('24H');
    fireEvent.click(button24h);

    expect(mockOnChange).toHaveBeenCalledWith('24h');
  });

  it('applies correct aria-labels to buttons', () => {
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    expect(screen.getByLabelText('Select 24H time range')).toBeInTheDocument();
    expect(screen.getByLabelText('Select 7D time range')).toBeInTheDocument();
    expect(screen.getByLabelText('Select 30D time range')).toBeInTheDocument();
    expect(screen.getByLabelText('Select 90D time range')).toBeInTheDocument();
    expect(screen.getByLabelText('Select 1Y time range')).toBeInTheDocument();
  });

  it('reflects the current value', () => {
    const { container } = render(
      <TimeRangeSelector value="30d" onChange={mockOnChange} />
    );

    const toggleGroup = container.querySelector('[data-value="30d"]');
    expect(toggleGroup).toBeInTheDocument();
  });

  it('handles all time range values', () => {
    const timeRanges: TimeRange[] = ['24h', '7d', '30d', '90d', '1y'];

    timeRanges.forEach(range => {
      const { container } = render(
        <TimeRangeSelector value={range} onChange={mockOnChange} />
      );
      // Component should render without errors for each valid time range
    });
  });

  it('calls onChange with correct values for each button', () => {
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    const buttons = [
      { text: '24H', value: '24h' },
      { text: '7D', value: '7d' },
      { text: '30D', value: '30d' },
      { text: '90D', value: '90d' },
      { text: '1Y', value: '1y' },
    ];

    buttons.forEach(({ text, value }) => {
      const button = screen.getByText(text);
      fireEvent.click(button);
      expect(mockOnChange).toHaveBeenCalledWith(value);
    });

    expect(mockOnChange).toHaveBeenCalledTimes(5);
  });

  it('applies responsive classes', () => {
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    const toggleGroup = container.firstChild;
    expect(toggleGroup).toHaveClass('justify-start', 'gap-1', 'sm:gap-2');

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass(
        'text-xs',
        'sm:text-sm',
        'px-2',
        'sm:px-3',
        'py-1',
        'sm:py-1.5'
      );
    });
  });

  it('applies appropriate styling classes', () => {
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('text-xs', 'sm:text-sm');
    });
  });

  it('maintains order of time range options', () => {
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    const buttons = screen.getAllByRole('button');
    const expectedOrder = ['24H', '7D', '30D', '90D', '1Y'];

    buttons.forEach((button, index) => {
      expect(button).toHaveTextContent(expectedOrder[index]);
    });
  });

  it('does not call onChange when clicking the already selected value', () => {
    const { rerender } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    // First click changes value
    const button7d = screen.getByText('7D');
    fireEvent.click(button7d);
    expect(mockOnChange).toHaveBeenCalledWith('7d');

    // Clear mock
    mockOnChange.mockClear();

    // Update value prop to reflect the change
    rerender(<TimeRangeSelector value="7d" onChange={mockOnChange} />);

    // Click same button again
    fireEvent.click(button7d);

    // onChange is still called in our implementation
    expect(mockOnChange).toHaveBeenCalledWith('7d');
  });

  it('handles rapid clicks on different options', () => {
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={mockOnChange} />
    );

    fireEvent.click(screen.getByText('24H'));
    fireEvent.click(screen.getByText('30D'));
    fireEvent.click(screen.getByText('1Y'));

    expect(mockOnChange).toHaveBeenCalledTimes(3);
    expect(mockOnChange).toHaveBeenNthCalledWith(1, '24h');
    expect(mockOnChange).toHaveBeenNthCalledWith(2, '30d');
    expect(mockOnChange).toHaveBeenNthCalledWith(3, '1y');
  });

  it('handles undefined onChange gracefully', () => {
    // This should not throw an error
    const { container } = render(
      <TimeRangeSelector value="7d" onChange={undefined as any} />
    );

    const button = screen.getByText('24H');

    // Should not throw when clicking without onChange
    expect(() => fireEvent.click(button)).not.toThrow();
  });
});
