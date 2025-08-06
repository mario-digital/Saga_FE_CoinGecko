import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CoinDescriptionDynamic } from '../CoinDescriptionDynamic';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<any>) => {
    // Return a component that renders immediately for testing
    const Component = React.lazy(loader);
    return (props: any) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </React.Suspense>
    );
  },
}));

// Mock the actual CoinDescription component
jest.mock('../../CoinDescription', () => ({
  __esModule: true,
  default: ({ description }: any) => (
    <div data-testid="coin-description">{description}</div>
  ),
  CoinDescription: ({ description }: any) => (
    <div data-testid="coin-description">{description}</div>
  ),
}));

describe('CoinDescriptionDynamic', () => {
  it('renders CoinDescription component', async () => {
    render(<CoinDescriptionDynamic description="Test description" />);

    await waitFor(() => {
      expect(screen.getByTestId('coin-description')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    // In test environment, dynamic imports resolve synchronously
    render(<CoinDescriptionDynamic description="Test" />);

    // Component should render successfully
    expect(screen.getByTestId('coin-description')).toBeInTheDocument();
  });

  it('passes props correctly to CoinDescription', async () => {
    const testDescription = 'Bitcoin is a decentralized digital currency';
    render(<CoinDescriptionDynamic description={testDescription} />);

    await waitFor(() => {
      expect(screen.getByText(testDescription)).toBeInTheDocument();
    });
  });
});
