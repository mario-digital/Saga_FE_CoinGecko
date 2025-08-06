import React from 'react';
import { render } from '@testing-library/react';
import Head from '../head';

describe('Head', () => {
  it('renders without errors', () => {
    const { container } = render(<Head />);
    expect(container).toBeDefined();
  });

  it('returns the expected content', () => {
    const result = Head();
    expect(result).toBeTruthy();
    expect(result.props.children).toHaveLength(4);
  });

  it('is a valid React component', () => {
    expect(typeof Head).toBe('function');
  });

  it('renders preconnect and dns-prefetch links', () => {
    const result = Head();

    // Check that the component returns the expected structure
    expect(result).toBeTruthy();
    expect(result.props.children).toBeDefined();

    // Verify the children array contains the expected link elements
    const children = React.Children.toArray(result.props.children);
    expect(children).toHaveLength(4);

    // Count preconnect and dns-prefetch links
    const preconnectCount = children.filter(
      (child: any) => child.props && child.props.rel === 'preconnect'
    ).length;
    const dnsPrefetchCount = children.filter(
      (child: any) => child.props && child.props.rel === 'dns-prefetch'
    ).length;

    expect(preconnectCount).toBe(3);
    expect(dnsPrefetchCount).toBe(1);
  });
});
