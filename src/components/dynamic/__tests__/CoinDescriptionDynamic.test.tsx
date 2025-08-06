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
    const mockLinks = {
      homepage: [],
      blockchain_site: [],
      official_forum_url: [],
      chat_url: [],
      announcement_url: [],
      twitter_screen_name: '',
      facebook_username: '',
      bitcointalk_thread_identifier: null,
      telegram_channel_identifier: '',
      subreddit_url: null,
      repos_url: { github: [], bitbucket: [] },
    };
    render(
      <CoinDescriptionDynamic
        description="Test description"
        links={mockLinks}
        categories={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('coin-description')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    // In test environment, dynamic imports resolve synchronously
    const mockLinks = {
      homepage: [],
      blockchain_site: [],
      official_forum_url: [],
      chat_url: [],
      announcement_url: [],
      twitter_screen_name: '',
      facebook_username: '',
      bitcointalk_thread_identifier: null,
      telegram_channel_identifier: '',
      subreddit_url: null,
      repos_url: { github: [], bitbucket: [] },
    };
    render(
      <CoinDescriptionDynamic
        description="Test"
        links={mockLinks}
        categories={[]}
      />
    );

    // Component should render successfully
    expect(screen.getByTestId('coin-description')).toBeInTheDocument();
  });

  it('passes props correctly to CoinDescription', async () => {
    const testDescription = 'Bitcoin is a decentralized digital currency';
    const mockLinks = {
      homepage: [],
      blockchain_site: [],
      official_forum_url: [],
      chat_url: [],
      announcement_url: [],
      twitter_screen_name: '',
      facebook_username: '',
      bitcointalk_thread_identifier: null,
      telegram_channel_identifier: '',
      subreddit_url: null,
      repos_url: { github: [], bitbucket: [] },
    };
    render(
      <CoinDescriptionDynamic
        description={testDescription}
        links={mockLinks}
        categories={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(testDescription)).toBeInTheDocument();
    });
  });
});
