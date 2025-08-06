import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('accepts value prop', () => {
    render(<Input value="test value" onChange={() => {}} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('handles onChange events', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('applies default styling classes', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'flex',
      'h-9',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-transparent',
      'px-3',
      'py-1',
      'text-base'
    );
  });

  it('accepts type prop', () => {
    render(<Input type="email" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('accepts placeholder prop', () => {
    render(<Input placeholder="Enter text..." />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text...');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    );
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('accepts all standard input attributes', () => {
    render(
      <Input
        name="test-input"
        id="test-id"
        required
        minLength={5}
        maxLength={10}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'test-input');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('minLength', '5');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('handles focus events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn();
    render(<Input onKeyDown={handleKeyDown} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleKeyDown).toHaveBeenCalled();
  });
});
