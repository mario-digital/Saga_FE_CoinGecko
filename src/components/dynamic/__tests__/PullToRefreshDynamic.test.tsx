import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PullToRefreshDynamic } from '../PullToRefreshDynamic';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<any>) => {
    const Component = React.lazy(loader);
    return (props: any) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </React.Suspense>
    );
  },
}));

// Mock the actual PullToRefresh component
jest.mock('../../PullToRefresh', () => ({
  __esModule: true,
  default: ({ children, onRefresh }: any) => (
    <div data-testid="pull-to-refresh" onClick={onRefresh}>
      {children}
    </div>
  ),
}));

describe('PullToRefreshDynamic', () => {
  it('renders PullToRefresh component', async () => {
    render(
      <PullToRefreshDynamic onRefresh={jest.fn()}>
        <div>Child content</div>
      </PullToRefreshDynamic>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pull-to-refresh')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  it('passes onRefresh callback correctly', async () => {
    const mockOnRefresh = jest.fn();
    render(
      <PullToRefreshDynamic onRefresh={mockOnRefresh}>
        <div>Content</div>
      </PullToRefreshDynamic>
    );

    await waitFor(() => {
      const pullToRefresh = screen.getByTestId('pull-to-refresh');
      pullToRefresh.click();
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('renders children correctly', async () => {
    render(
      <PullToRefreshDynamic onRefresh={jest.fn()}>
        <div>First child</div>
        <div>Second child</div>
      </PullToRefreshDynamic>
    );

    await waitFor(() => {
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });
  });
});
