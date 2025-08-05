/**
 * Tests for PriceChanges component
 */

import { render, screen } from '@testing-library/react';
import { PriceChanges } from '../PriceChanges';

describe('PriceChanges', () => {
  it('renders all timeframe labels', () => {
    const priceChanges = {
      '24h': 2.5,
      '7d': 5.3,
      '30d': -1.2,
      '1y': 150.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('24 Hours')).toBeInTheDocument();
    expect(screen.getByText('7 Days')).toBeInTheDocument();
    expect(screen.getByText('30 Days')).toBeInTheDocument();
    expect(screen.getByText('1 Year')).toBeInTheDocument();
  });

  it('displays positive changes with correct formatting', () => {
    const priceChanges = {
      '24h': 2.5,
      '7d': 5.3,
      '30d': 10.75,
      '1y': 150.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('+2.50%')).toBeInTheDocument();
    expect(screen.getByText('+5.30%')).toBeInTheDocument();
    expect(screen.getByText('+10.75%')).toBeInTheDocument();
    expect(screen.getByText('+150.70%')).toBeInTheDocument();
  });

  it('displays negative changes with correct formatting', () => {
    const priceChanges = {
      '24h': -2.5,
      '7d': -5.3,
      '30d': -10.75,
      '1y': -25.4,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('-2.50%')).toBeInTheDocument();
    expect(screen.getByText('-5.30%')).toBeInTheDocument();
    expect(screen.getByText('-10.75%')).toBeInTheDocument();
    expect(screen.getByText('-25.40%')).toBeInTheDocument();
  });

  it('displays bullish trend badge when all positive', () => {
    const priceChanges = {
      '24h': 2.5,
      '7d': 5.3,
      '30d': 1.2,
      '1y': 150.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('Bullish Trend')).toBeInTheDocument();
  });

  it('displays bearish trend badge when all negative', () => {
    const priceChanges = {
      '24h': -2.5,
      '7d': -5.3,
      '30d': -1.2,
      '1y': -15.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('Bearish Trend')).toBeInTheDocument();
  });

  it('displays mostly positive badge when majority positive', () => {
    const priceChanges = {
      '24h': 2.5,
      '7d': 5.3,
      '30d': -1.2,
      '1y': 150.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('Mostly Positive')).toBeInTheDocument();
  });

  it('displays mostly negative badge when majority negative', () => {
    const priceChanges = {
      '24h': -2.5,
      '7d': -5.3,
      '30d': 1.2,
      '1y': -150.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('Mostly Negative')).toBeInTheDocument();
  });

  it('displays mixed badge when equal positive and negative', () => {
    const priceChanges = {
      '24h': 2.5,
      '7d': -5.3,
      '30d': 1.2,
      '1y': -150.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('Mixed')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const priceChanges = {
      '24h': 0,
      '7d': 0,
      '30d': 0,
      '1y': 0,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getAllByText('+0.00%')).toHaveLength(4);
  });

  it('displays description text for each timeframe', () => {
    const priceChanges = {
      '24h': 2.5,
      '7d': 5.3,
      '30d': -1.2,
      '1y': 150.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
  });

  it('renders card with proper title and description', () => {
    const priceChanges = {
      '24h': 2.5,
      '7d': 5.3,
      '30d': -1.2,
      '1y': 150.7,
    };

    render(<PriceChanges priceChanges={priceChanges} />);

    expect(screen.getByText('Price Performance')).toBeInTheDocument();
    expect(
      screen.getByText('Percentage changes across different time periods')
    ).toBeInTheDocument();
  });
});
