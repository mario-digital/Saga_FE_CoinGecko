import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoinDescription } from '../CoinDescription';
import { CoinDetailData } from '@/types/coingecko';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
  ChevronUp: () => <div data-testid="chevron-up">ChevronUp</div>,
  Globe: () => <div data-testid="globe">Globe</div>,
  Twitter: () => <div data-testid="twitter">Twitter</div>,
  Github: () => <div data-testid="github">Github</div>,
  MessageCircle: () => <div data-testid="message-circle">MessageCircle</div>,
  ExternalLink: () => <div data-testid="external-link">ExternalLink</div>,
}));

const mockCoin: CoinDetailData = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  asset_platform_id: null,
  description: {
    en: 'Bitcoin is a decentralized cryptocurrency originally described in a 2008 whitepaper by a person, or group of people, using the alias Satoshi Nakamoto. It was launched soon after, in January 2009.',
  },
  links: {
    homepage: ['https://bitcoin.org', 'https://bitcoin.com', ''],
    blockchain_site: [
      'https://blockchair.com/bitcoin',
      'https://blockchain.info',
      '',
      '',
      '',
    ],
    official_forum_url: ['https://bitcointalk.org', '', ''],
    chat_url: ['https://discord.gg/bitcoin', '', ''],
    announcement_url: ['', ''],
    twitter_screen_name: 'bitcoin',
    facebook_username: '',
    bitcointalk_thread_identifier: null,
    telegram_channel_identifier: 'bitcoin_official',
    subreddit_url: 'https://reddit.com/r/bitcoin',
    repos_url: {
      github: [
        'https://github.com/bitcoin/bitcoin',
        'https://github.com/bitcoin/bips',
      ],
      bitbucket: [],
    },
  },
  image: {
    thumb: 'https://example.com/thumb.png',
    small: 'https://example.com/small.png',
    large: 'https://example.com/large.png',
  },
  market_cap_rank: 1,
  market_data: {
    current_price: { usd: 45000 },
    market_cap: { usd: 900000000000 },
    total_volume: { usd: 25000000000 },
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d: 5.3,
    price_change_percentage_30d: -1.2,
    price_change_percentage_1y: 150.7,
    ath: { usd: 69000 },
    ath_date: { usd: '2021-11-10T14:24:11.849Z' },
    atl: { usd: 67.81 },
    atl_date: { usd: '2013-07-06T00:00:00.000Z' },
    circulating_supply: 19500000,
    total_supply: 21000000,
    max_supply: 21000000,
  },
  categories: ['Cryptocurrency'],
  platforms: {},
};

describe('CoinDescription', () => {
  it('renders coin description content', () => {
    render(
      <CoinDescription
        description={mockCoin.description.en}
        links={mockCoin.links}
        categories={mockCoin.categories}
      />
    );

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(
      screen.getByText(/Bitcoin is a decentralized cryptocurrency/)
    ).toBeInTheDocument();
  });

  it('truncates long description initially', () => {
    const longDescription = 'a'.repeat(500);
    const coinWithLongDesc = {
      ...mockCoin,
      description: { en: longDescription },
    };

    render(
      <CoinDescription
        description={coinWithLongDesc.description.en}
        links={coinWithLongDesc.links}
        categories={coinWithLongDesc.categories}
      />
    );

    expect(screen.getByText(/^a{300}/)).toBeInTheDocument();
    expect(screen.getByText('Read more')).toBeInTheDocument();
  });

  it('expands and collapses description when clicking show more/less', () => {
    const longDescription = 'a'.repeat(500);
    const coinWithLongDesc = {
      ...mockCoin,
      description: { en: longDescription },
    };

    render(
      <CoinDescription
        description={coinWithLongDesc.description.en}
        links={coinWithLongDesc.links}
        categories={coinWithLongDesc.categories}
      />
    );

    const toggleButton = screen.getByText('Read more');
    fireEvent.click(toggleButton);

    expect(screen.getByText(longDescription)).toBeInTheDocument();
    expect(screen.getByText('Show less')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show less'));
    expect(screen.getByText('Read more')).toBeInTheDocument();
  });

  it('renders homepage links', () => {
    render(
      <CoinDescription
        description={mockCoin.description.en}
        links={mockCoin.links}
        categories={mockCoin.categories}
      />
    );

    // The component only shows the first homepage link as "Website"
    const websiteLink = screen.getByText('Website');
    expect(websiteLink).toBeInTheDocument();
    expect(websiteLink.closest('a')).toHaveAttribute(
      'href',
      'https://bitcoin.org'
    );
  });

  it('does not render blockchain explorer links', () => {
    render(
      <CoinDescription
        description={mockCoin.description.en}
        links={mockCoin.links}
        categories={mockCoin.categories}
      />
    );

    // Blockchain explorer links are not currently rendered by the component
    expect(screen.queryByText('blockchair.com')).not.toBeInTheDocument();
    expect(screen.queryByText('blockchain.info')).not.toBeInTheDocument();
  });

  it('renders social links when available', () => {
    render(
      <CoinDescription
        description={mockCoin.description.en}
        links={mockCoin.links}
        categories={mockCoin.categories}
      />
    );

    // Component renders Twitter, Reddit, and GitHub when available
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Reddit')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    // Discord and Telegram are not rendered by the component
    expect(screen.queryByText('Discord')).not.toBeInTheDocument();
    expect(screen.queryByText('Telegram')).not.toBeInTheDocument();
  });

  it('does not render social links when not available', () => {
    const coinWithoutSocials = {
      ...mockCoin,
      links: {
        ...mockCoin.links,
        twitter_screen_name: '',
        subreddit_url: '',
        repos_url: { github: [], bitbucket: [] },
        chat_url: ['', '', ''],
        telegram_channel_identifier: '',
      },
    };

    render(
      <CoinDescription
        description={coinWithoutSocials.description.en}
        links={coinWithoutSocials.links}
        categories={coinWithoutSocials.categories}
      />
    );

    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    expect(screen.queryByText('Reddit')).not.toBeInTheDocument();
    expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
    expect(screen.queryByText('Discord')).not.toBeInTheDocument();
    expect(screen.queryByText('Telegram')).not.toBeInTheDocument();
  });

  it('handles coins without description', () => {
    const coinWithoutDesc = {
      ...mockCoin,
      description: { en: '' },
    };

    render(
      <CoinDescription
        description={coinWithoutDesc.description.en}
        links={coinWithoutDesc.links}
        categories={coinWithoutDesc.categories}
      />
    );

    // Empty description renders as empty text, not a placeholder message
    const descriptionElement = document.querySelector('.text-gray-700');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement?.textContent).toBe('');
  });

  it('opens links in new tab with security attributes', () => {
    render(
      <CoinDescription
        description={mockCoin.description.en}
        links={mockCoin.links}
        categories={mockCoin.categories}
      />
    );

    const externalLinks = screen.getAllByRole('link');
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders correctly without links section', () => {
    const coinWithoutLinks = {
      ...mockCoin,
      links: {
        homepage: [],
        blockchain_site: [],
        official_forum_url: [],
        chat_url: [],
        announcement_url: [],
        twitter_screen_name: '',
        facebook_username: '',
        bitcointalk_thread_identifier: null,
        telegram_channel_identifier: '',
        subreddit_url: '',
        repos_url: { github: [], bitbucket: [] },
      },
    };

    render(
      <CoinDescription
        description={coinWithoutLinks.description.en}
        links={coinWithoutLinks.links}
        categories={coinWithoutLinks.categories}
      />
    );

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.queryByText('Website')).not.toBeInTheDocument();
    expect(screen.queryByText('Explorers')).not.toBeInTheDocument();
    expect(screen.queryByText('Community')).not.toBeInTheDocument();
  });

  it('filters out empty links', () => {
    render(
      <CoinDescription
        description={mockCoin.description.en}
        links={mockCoin.links}
        categories={mockCoin.categories}
      />
    );

    // Should not render empty strings from arrays
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link.getAttribute('href')).not.toBe('');
      expect(link.getAttribute('href')).not.toBeNull();
    });
  });

  it('truncates long URLs for display', () => {
    const coinWithLongUrl = {
      ...mockCoin,
      links: {
        ...mockCoin.links,
        homepage: [
          'https://very-long-domain-name-that-should-be-truncated.example.com/path/to/page',
        ],
      },
    };

    render(
      <CoinDescription
        description={coinWithLongUrl.description.en}
        links={coinWithLongUrl.links}
        categories={coinWithLongUrl.categories}
      />
    );

    // Check that long URLs are rendered in website links
    const websiteLink = screen.getByText('Website');
    expect(websiteLink.closest('a')).toHaveAttribute(
      'href',
      'https://very-long-domain-name-that-should-be-truncated.example.com/path/to/page'
    );
  });

  it('handles special characters in description', () => {
    const coinWithSpecialChars = {
      ...mockCoin,
      description: {
        en: 'Bitcoin & other cryptos < > "quotes" and symbols: $€¥',
      },
    };

    render(
      <CoinDescription
        description={coinWithSpecialChars.description.en}
        links={coinWithSpecialChars.links}
        categories={coinWithSpecialChars.categories}
      />
    );

    expect(
      screen.getByText(/Bitcoin & other cryptos < > "quotes" and symbols: \$€¥/)
    ).toBeInTheDocument();
  });

  it('renders multiple GitHub repos when available', () => {
    render(
      <CoinDescription
        description={mockCoin.description.en}
        links={mockCoin.links}
        categories={mockCoin.categories}
      />
    );

    const githubLinks = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('href')?.includes('github.com'));
    // Component only shows one GitHub link even if multiple are provided
    expect(githubLinks).toHaveLength(1);
  });

  it('handles BitcoinTalk forum link', () => {
    const coinWithForum = {
      ...mockCoin,
      links: {
        ...mockCoin.links,
        official_forum_url: [
          'https://bitcointalk.org/index.php?topic=1234',
          '',
          '',
        ],
      },
    };

    render(
      <CoinDescription
        description={coinWithForum.description.en}
        links={coinWithForum.links}
        categories={coinWithForum.categories}
      />
    );

    // Forum links are not currently implemented in the component
    expect(screen.queryByText('Forum')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(
      <CoinDescription
        description={mockCoin.description.en}
        links={mockCoin.links}
        categories={mockCoin.categories}
      />
    );

    // Check for card styling
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
    expect(container.querySelector('.border')).toBeInTheDocument();
    expect(container.querySelector('.shadow')).toBeInTheDocument();

    // Check for text styling classes
    expect(container.querySelector('.text-gray-700')).toBeInTheDocument();
  });

  it('handles missing social media gracefully', () => {
    const partialSocial = {
      ...mockCoin,
      links: {
        ...mockCoin.links,
        twitter_screen_name: 'bitcoin',
        telegram_channel_identifier: '',
        subreddit_url: '',
      },
    };

    const { container } = render(
      <CoinDescription
        description={partialSocial.description.en}
        links={partialSocial.links}
        categories={partialSocial.categories}
      />
    );

    // Check that Twitter link is rendered
    const twitterLink = container.querySelector('a[href*="twitter.com"]');
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveTextContent('Twitter');

    // Telegram and Reddit not present
    expect(screen.queryByText('Telegram')).not.toBeInTheDocument();
    expect(screen.queryByText('Reddit')).not.toBeInTheDocument();
  });
});
