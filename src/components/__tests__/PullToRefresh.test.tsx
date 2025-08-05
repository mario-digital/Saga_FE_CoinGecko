/**
 * Tests for PullToRefresh component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PullToRefresh } from '../PullToRefresh';

describe('PullToRefresh', () => {
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    mockOnRefresh.mockClear();
    // Mock touch events
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: jest.fn(),
    });
  });

  it('renders children correctly', () => {
    render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows pull indicator when pulling down', async () => {
    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;

    // Simulate pull down
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 180 }], // 80px pull
    });

    // Should show pull indicator
    expect(screen.getByText('Pull to refresh')).toBeInTheDocument();
  });

  it('shows release indicator when pulled enough', async () => {
    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;

    // Simulate pull down past threshold
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 220 }], // 120px pull (past 100px threshold)
    });

    // Should show release indicator
    expect(screen.getByText('Release to refresh')).toBeInTheDocument();
  });

  it('triggers refresh when released after threshold', async () => {
    mockOnRefresh.mockResolvedValue(undefined);

    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;

    // Simulate pull and release
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 220 }], // Past threshold
    });

    fireEvent.touchEnd(pullContainer);

    // Should trigger refresh
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });

    // Should show refreshing state
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();
  });

  it('does not trigger refresh when released before threshold', async () => {
    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;

    // Simulate small pull and release
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 150 }], // Only 50px (below threshold)
    });

    fireEvent.touchEnd(pullContainer);

    // Should not trigger refresh
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it('disables pull when disabled prop is true', () => {
    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh} disabled>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;

    // Try to pull
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 220 }],
    });

    // Should not show any indicator
    expect(screen.queryByText('Pull to refresh')).not.toBeInTheDocument();
    expect(screen.queryByText('Release to refresh')).not.toBeInTheDocument();

    fireEvent.touchEnd(pullContainer);

    // Should not trigger refresh
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it('prevents pull when scrolled down', () => {
    // Mock scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 100,
    });

    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;

    // Try to pull
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 220 }],
    });

    // Should not show indicator when scrolled
    expect(screen.queryByText('Pull to refresh')).not.toBeInTheDocument();
  });

  it('handles async refresh correctly', async () => {
    let resolveRefresh: () => void;
    const refreshPromise = new Promise<void>(resolve => {
      resolveRefresh = resolve;
    });
    mockOnRefresh.mockReturnValue(refreshPromise);

    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;

    // Trigger refresh
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 220 }],
    });

    fireEvent.touchEnd(pullContainer);

    // Should show refreshing state
    await waitFor(() => {
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });

    // Resolve refresh
    resolveRefresh!();

    // Should hide refreshing state
    await waitFor(() => {
      expect(screen.queryByText('Refreshing...')).not.toBeInTheDocument();
    });
  });

  it('applies correct transform styles when pulling', () => {
    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;
    const contentDiv = pullContainer.querySelector(
      '[style*="transform"]'
    ) as HTMLElement;

    // Initial state
    expect(contentDiv.style.transform).toBe('translateY(0px)');

    // Pull down
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 150 }],
    });

    // Should apply transform (with resistance)
    expect(contentDiv.style.transform).toMatch(/translateY\(\d+px\)/);
  });

  it('shows correct icons for different states', async () => {
    const { container } = render(
      <PullToRefresh onRefresh={mockOnRefresh}>
        <div>Test Content</div>
      </PullToRefresh>
    );

    const pullContainer = container.firstChild as HTMLElement;

    // Pull state - should show down arrow
    fireEvent.touchStart(pullContainer, {
      touches: [{ clientY: 100 }],
    });

    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 180 }],
    });

    expect(screen.getByLabelText('Pull down arrow')).toBeInTheDocument();

    // Release state - should show refresh icon
    fireEvent.touchMove(pullContainer, {
      touches: [{ clientY: 220 }],
    });

    expect(screen.getByLabelText('Refresh icon')).toBeInTheDocument();
  });
});
