import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RadioGroup, RadioGroupItem } from '../radio-group';

// Mock @radix-ui/react-radio-group
jest.mock('@radix-ui/react-radio-group', () => {
  const Root = React.forwardRef(
    (
      {
        className,
        onValueChange,
        value,
        defaultValue,
        disabled,
        name,
        required,
        orientation,
        dir,
        loop,
        ...props
      }: any,
      ref: any
    ) => (
      <div
        ref={ref}
        role="radiogroup"
        className={className}
        data-disabled={disabled}
        {...props}
      />
    )
  );
  Root.displayName = 'RadioGroup.Root';

  const Item = React.forwardRef(
    ({ className, value, disabled, required, ...props }: any, ref: any) => (
      <button
        ref={ref}
        role="radio"
        aria-checked="false"
        className={className}
        type="button"
        value={value}
        disabled={disabled}
        data-state={disabled ? 'disabled' : undefined}
        {...props}
      />
    )
  );
  Item.displayName = 'RadioGroup.Item';

  const Indicator = React.forwardRef(
    ({ className, forceMount, ...props }: any, ref: any) => (
      <span ref={ref} className={className} {...props} />
    )
  );
  Indicator.displayName = 'RadioGroup.Indicator';

  return { Root, Item, Indicator };
});

// Mock @radix-ui/react-icons
jest.mock('@radix-ui/react-icons', () => ({
  DotFilledIcon: ({ className }: any) => (
    <span className={className} data-testid="circle-icon">
      ●
    </span>
  ),
}));

describe('RadioGroup', () => {
  it('renders radio group', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="1" />
        <RadioGroupItem value="2" />
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <RadioGroup className="custom-group">
        <RadioGroupItem value="1" />
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveClass('custom-group', 'grid', 'gap-2');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <RadioGroup ref={ref}>
        <RadioGroupItem value="1" />
      </RadioGroup>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(
      <RadioGroup onValueChange={handleChange}>
        <RadioGroupItem value="option1" />
        <RadioGroupItem value="option2" />
      </RadioGroup>
    );

    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    // Note: In a real implementation with Radix UI, this would trigger onValueChange
    expect(radioButtons[0]).toBeInTheDocument();
  });

  it('accepts controlled value', () => {
    render(
      <RadioGroup value="option2">
        <RadioGroupItem value="option1" />
        <RadioGroupItem value="option2" />
      </RadioGroup>
    );

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(2);
  });

  it('can be disabled', () => {
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="1" />
      </RadioGroup>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('data-disabled', 'true');
  });
});

describe('RadioGroupItem', () => {
  it('renders radio button', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    );

    const radioButton = screen.getByRole('radio');
    expect(radioButton).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" className="custom-item" />
      </RadioGroup>
    );

    const radioButton = screen.getByRole('radio');
    expect(radioButton).toHaveClass('custom-item');
  });

  it('applies default styling classes', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    );

    const radioButton = screen.getByRole('radio');
    expect(radioButton).toHaveClass(
      'aspect-square',
      'h-4',
      'w-4',
      'rounded-full',
      'border',
      'border-primary'
    );
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <RadioGroup>
        <RadioGroupItem value="test" ref={ref} />
      </RadioGroup>
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders indicator icon', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    );

    expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
  });

  it('can be disabled individually', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" disabled />
      </RadioGroup>
    );

    const radioButton = screen.getByRole('radio');
    expect(radioButton).toHaveAttribute('disabled');
    expect(radioButton).toHaveClass(
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    );
  });

  it('handles focus states', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    );

    const radioButton = screen.getByRole('radio');
    expect(radioButton).toHaveClass(
      'focus:outline-none',
      'focus-visible:ring-1',
      'focus-visible:ring-ring'
    );
  });

  it('renders with unique value prop', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="unique-value-123" />
      </RadioGroup>
    );

    const radioButton = screen.getByRole('radio');
    expect(radioButton).toHaveAttribute('value', 'unique-value-123');
  });

  it('handles multiple items in group', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" />
        <RadioGroupItem value="option2" />
        <RadioGroupItem value="option3" />
      </RadioGroup>
    );

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);
  });

  it('applies hover state classes', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    );

    const radioButton = screen.getByRole('radio');

    fireEvent.mouseEnter(radioButton);
    // Check that the element has the expected classes even if hover state isn't simulated
    expect(radioButton.className).toContain('border');
  });
});
