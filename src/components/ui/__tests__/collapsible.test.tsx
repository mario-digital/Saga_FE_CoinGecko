import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../collapsible';

describe('Collapsible', () => {
  it('renders collapsible components', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('exports all required components', () => {
    expect(Collapsible).toBeDefined();
    expect(CollapsibleTrigger).toBeDefined();
    expect(CollapsibleContent).toBeDefined();
  });

  it('toggles content visibility when trigger is clicked', async () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Click me</CollapsibleTrigger>
        <CollapsibleContent>
          <div>Hidden content</div>
        </CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Click me');

    // Content should be collapsed initially
    const content = container.querySelector('[data-state="closed"]');
    expect(content).toBeInTheDocument();

    // Click to expand
    fireEvent.click(trigger);

    // Wait for animation
    await waitFor(() => {
      const expandedContent = container.querySelector('[data-state="open"]');
      expect(expandedContent).toBeInTheDocument();
    });

    // Click to collapse
    fireEvent.click(trigger);

    await waitFor(() => {
      const collapsedContent = container.querySelector('[data-state="closed"]');
      expect(collapsedContent).toBeInTheDocument();
    });
  });

  it('can be controlled with open prop', () => {
    const { rerender } = render(
      <Collapsible open={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    let content = document.querySelector('[data-state="closed"]');
    expect(content).toBeInTheDocument();

    rerender(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    content = document.querySelector('[data-state="open"]');
    expect(content).toBeInTheDocument();
  });

  it('calls onOpenChange when state changes', () => {
    const handleOpenChange = jest.fn();

    const { container } = render(
      <Collapsible onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Toggle');
    fireEvent.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);

    fireEvent.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders trigger as button by default', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Button trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Button trigger');
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('allows custom trigger element with asChild', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <div role="button" tabIndex={0}>
            Custom trigger
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Custom trigger');
    expect(trigger.tagName).toBe('DIV');
  });

  it('supports disabled state', () => {
    const handleOpenChange = jest.fn();

    const { container } = render(
      <Collapsible disabled onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Disabled trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Disabled trigger');
    fireEvent.click(trigger);

    // Should not call handler when disabled
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('renders multiple content sections', () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <div>First content</div>
        </CollapsibleContent>
        <CollapsibleContent>
          <div>Second content</div>
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.getByText('Second content')).toBeInTheDocument();
  });

  it('works with keyboard navigation', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Keyboard trigger</CollapsibleTrigger>
        <CollapsibleContent>
          <div>Keyboard content</div>
        </CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Keyboard trigger');

    // Focus the trigger
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // Press Enter to toggle
    await user.keyboard('{Enter}');

    const openContent = document.querySelector('[data-state="open"]');
    expect(openContent).toBeInTheDocument();

    // Press Space to toggle back
    await user.keyboard(' ');

    const closedContent = document.querySelector('[data-state="closed"]');
    expect(closedContent).toBeInTheDocument();
  });

  it('maintains focus on trigger after toggle', async () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Focus trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Focus trigger');
    trigger.focus();

    fireEvent.click(trigger);

    // Focus should remain on trigger
    expect(document.activeElement).toBe(trigger);
  });

  it('applies custom className to components', () => {
    const { container } = render(
      <Collapsible className="custom-root">
        <CollapsibleTrigger className="custom-trigger">
          Styled trigger
        </CollapsibleTrigger>
        <CollapsibleContent className="custom-content">
          Styled content
        </CollapsibleContent>
      </Collapsible>
    );

    expect(container.querySelector('.custom-root')).toBeInTheDocument();
    expect(container.querySelector('.custom-trigger')).toBeInTheDocument();
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
  });

  it('passes through data attributes', () => {
    const { container } = render(
      <Collapsible data-testid="collapsible-root">
        <CollapsibleTrigger data-testid="collapsible-trigger">
          Trigger
        </CollapsibleTrigger>
        <CollapsibleContent data-testid="collapsible-content">
          Content
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByTestId('collapsible-root')).toBeInTheDocument();
    expect(screen.getByTestId('collapsible-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('collapsible-content')).toBeInTheDocument();
  });

  it('supports defaultOpen prop', () => {
    const { container } = render(
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger>Initially open</CollapsibleTrigger>
        <CollapsibleContent>Visible content</CollapsibleContent>
      </Collapsible>
    );

    const content = container.querySelector('[data-state="open"]');
    expect(content).toBeInTheDocument();
  });

  it('handles rapid toggle clicks', async () => {
    const handleOpenChange = jest.fn();

    const { container } = render(
      <Collapsible onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Rapid toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Rapid toggle');

    // Rapid clicks
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    fireEvent.click(trigger);

    // Should handle all clicks
    expect(handleOpenChange).toHaveBeenCalledTimes(4);
  });

  it('works without content', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>No content trigger</CollapsibleTrigger>
      </Collapsible>
    );

    const trigger = screen.getByText('No content trigger');
    expect(() => fireEvent.click(trigger)).not.toThrow();
  });

  it('works without trigger', () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleContent>Content only</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('Content only')).toBeInTheDocument();
  });

  it('supports nested collapsibles', () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Outer trigger</CollapsibleTrigger>
        <CollapsibleContent>
          <Collapsible defaultOpen>
            <CollapsibleTrigger>Inner trigger</CollapsibleTrigger>
            <CollapsibleContent>Inner content</CollapsibleContent>
          </Collapsible>
        </CollapsibleContent>
      </Collapsible>
    );

    expect(screen.getByText('Outer trigger')).toBeInTheDocument();
    expect(screen.getByText('Inner trigger')).toBeInTheDocument();
    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it('handles content with form elements', async () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Form trigger</CollapsibleTrigger>
        <CollapsibleContent>
          <form>
            <input type="text" defaultValue="test value" />
            <button type="submit">Submit</button>
          </form>
        </CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Form trigger');
    const input = container.querySelector('input') as HTMLInputElement;
    const submitButton = screen.getByText('Submit');

    // Verify initial state
    expect(container.querySelector('[data-state="open"]')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('test value');
    expect(submitButton).toBeInTheDocument();

    // Close
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(
        container.querySelector('[data-state="closed"]')
      ).toBeInTheDocument();
    });

    // Reopen
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(
        container.querySelector('[data-state="open"]')
      ).toBeInTheDocument();
    });

    // Elements should still be present
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('handles aria attributes correctly', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger aria-label="Toggle section">
          Toggle
        </CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Toggle');

    // Should have aria-expanded
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('component types are correct', () => {
    // Type checking - these should be React components
    expect(typeof Collapsible).toBe('object');
    expect(typeof CollapsibleTrigger).toBe('object');
    expect(typeof CollapsibleContent).toBe('object');

    // Should have expected properties from Radix
    expect(Collapsible.displayName).toBeDefined();
    expect(CollapsibleTrigger.displayName).toBeDefined();
    expect(CollapsibleContent.displayName).toBeDefined();
  });
});
