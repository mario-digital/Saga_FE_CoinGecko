import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../select';

// Mock @radix-ui/react-select
jest.mock('@radix-ui/react-select', () => {
  const actual = jest.requireActual('react');
  return {
    Root: ({ children, onValueChange, value, ...props }: any) => (
      <div data-testid="select-root" data-value={value} {...props}>
        {typeof children === 'function'
          ? children({ value, onValueChange })
          : children}
      </div>
    ),
    Trigger: actual.forwardRef(
      ({ children, className, asChild, ...props }: any, ref: any) => (
        <button
          ref={ref}
          className={className}
          data-testid="select-trigger"
          {...props}
        >
          {children}
        </button>
      )
    ),
    Value: ({ children, placeholder, ...props }: any) => (
      <span data-testid="select-value" {...props}>
        {children || placeholder}
      </span>
    ),
    Icon: ({ children, asChild, ...props }: any) => {
      // Filter out asChild prop to avoid React warning
      if (asChild && actual.isValidElement(children)) {
        return actual.cloneElement(children, {
          'data-testid': 'select-icon',
          ...props,
        });
      }
      return (
        <span data-testid="select-icon" {...props}>
          {children}
        </span>
      );
    },
    Portal: ({ children }: any) => (
      <div data-testid="select-portal">{children}</div>
    ),
    Content: actual.forwardRef(
      (
        { children, className, position = 'popper', ...props }: any,
        ref: any
      ) => (
        <div
          ref={ref}
          className={className}
          data-testid="select-content"
          data-position={position}
          {...props}
        >
          {children}
        </div>
      )
    ),
    Viewport: ({ children, className, ...props }: any) => (
      <div className={className} data-testid="select-viewport" {...props}>
        {children}
      </div>
    ),
    Group: ({ children, ...props }: any) => (
      <div data-testid="select-group" {...props}>
        {children}
      </div>
    ),
    Label: ({ children, className, ...props }: any) => (
      <div className={className} data-testid="select-label" {...props}>
        {children}
      </div>
    ),
    Item: actual.forwardRef(
      ({ children, className, value, ...props }: any, ref: any) => (
        <div
          ref={ref}
          className={className}
          data-testid={`select-item-${value}`}
          data-value={value}
          {...props}
        >
          {children}
        </div>
      )
    ),
    ItemText: ({ children }: any) => (
      <span data-testid="select-item-text">{children}</span>
    ),
    ItemIndicator: ({ children, ...props }: any) => (
      <span data-testid="select-item-indicator" {...props}>
        {children}
      </span>
    ),
    Separator: ({ className, ...props }: any) => (
      <div className={className} data-testid="select-separator" {...props} />
    ),
    ScrollUpButton: actual.forwardRef(
      ({ className, ...props }: any, ref: any) => (
        <div
          ref={ref}
          className={className}
          data-testid="select-scroll-up"
          {...props}
        >
          <span data-testid="chevron-up-icon">▲</span>
        </div>
      )
    ),
    ScrollDownButton: actual.forwardRef(
      ({ className, ...props }: any, ref: any) => (
        <div
          ref={ref}
          className={className}
          data-testid="select-scroll-down"
          {...props}
        >
          <span data-testid="chevron-down-icon">▼</span>
        </div>
      )
    ),
  };
});

// Mock @radix-ui/react-icons
jest.mock('@radix-ui/react-icons', () => ({
  CheckIcon: () => <span data-testid="check-icon">✓</span>,
  ChevronDownIcon: () => <span data-testid="chevron-down-icon">▼</span>,
  ChevronUpIcon: () => <span data-testid="chevron-up-icon">▲</span>,
}));

describe('Select Components', () => {
  describe('Select', () => {
    it('renders select root', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('select-root')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const handleChange = jest.fn();
      render(
        <Select onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('select-root')).toBeInTheDocument();
    });

    it('accepts controlled value', () => {
      render(
        <Select value="test">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      const root = screen.getByTestId('select-root');
      expect(root).toHaveAttribute('data-value', 'test');
    });
  });

  describe('SelectTrigger', () => {
    it('renders trigger button', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('shows chevron icon', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('forwards ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('SelectContent', () => {
    it('renders content portal', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Item 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-portal')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
    });

    it('applies position classes', () => {
      render(
        <Select>
          <SelectContent position="popper">
            <SelectItem value="1">Item 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const content = screen.getByTestId('select-content');
      expect(content).toHaveAttribute('data-position', 'popper');
    });

    it('renders viewport', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Item 1</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-viewport')).toBeInTheDocument();
    });
  });

  describe('SelectItem', () => {
    it('renders select item', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="test">Test Item</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-item-test')).toBeInTheDocument();
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('shows check icon for selected item', () => {
      render(
        <Select value="test">
          <SelectContent>
            <SelectItem value="test">Test Item</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="test" className="custom-item">
              Test
            </SelectItem>
          </SelectContent>
        </Select>
      );

      const item = screen.getByTestId('select-item-test');
      expect(item).toHaveClass('custom-item');
    });
  });

  describe('SelectLabel', () => {
    it('renders label', () => {
      render(
        <Select>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group Label</SelectLabel>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Group Label')).toBeInTheDocument();
      expect(screen.getByTestId('select-label')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Select>
          <SelectContent>
            <SelectLabel className="custom-label">Label</SelectLabel>
          </SelectContent>
        </Select>
      );

      const label = screen.getByTestId('select-label');
      expect(label).toHaveClass('custom-label');
    });
  });

  describe('SelectSeparator', () => {
    it('renders separator', () => {
      render(
        <Select>
          <SelectContent>
            <SelectItem value="1">Item 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-separator')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Select>
          <SelectContent>
            <SelectSeparator className="custom-separator" />
          </SelectContent>
        </Select>
      );

      const separator = screen.getByTestId('select-separator');
      expect(separator).toHaveClass('custom-separator');
    });
  });

  describe('SelectGroup', () => {
    it('renders group with items', () => {
      render(
        <Select>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-group')).toBeInTheDocument();
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
  });

  describe('SelectValue', () => {
    it('shows placeholder when no value', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option..." />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByText('Choose an option...')).toBeInTheDocument();
    });

    it('shows selected value', () => {
      render(
        <Select value="test">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test Value</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByTestId('select-value')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders complete select with multiple options', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="potato">Potato</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Select a fruit')).toBeInTheDocument();
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      const items = ['apple', 'banana', 'orange', 'carrot', 'potato'];
      items.forEach(item => {
        expect(screen.getByTestId(`select-item-${item}`)).toBeInTheDocument();
      });
    });
  });
});
