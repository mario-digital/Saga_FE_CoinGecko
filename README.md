# Saga FE Coin Gecko

A modern, feature-rich cryptocurrency market data dashboard built with Next.js 15, React 19, and TypeScript. This application provides real-time cryptocurrency prices, market capitalizations, price charts, and trading volumes with a beautifully designed, fully responsive interface.

## 🚀 Features

### Core Features

- **📊 Real-time Crypto Data**: Live prices, market caps, and 24h changes from CoinGecko API
- **🔍 Advanced Search**: Instant search by coin name or symbol with keyboard shortcuts (Cmd/Ctrl+K)
- **🎯 Smart Filtering**: Filter coins by market cap categories (Top 10, Top 50, Top 100)
- **📈 Price History Charts**: Interactive charts with selectable time ranges (7d, 30d, 90d, 365d)
- **📱 Coin Detail Pages**: Comprehensive coin information with statistics and price visualizations
- **📄 Pagination**: Efficiently browse through thousands of cryptocurrencies

### UI/UX Excellence

- **🎨 Modern Card-Based Design**: Beautiful card layouts with coin logos and color-coded price changes
- **🌓 Dark/Light Theme**: Toggle between dark and light modes with system preference sync
- **📱 Fully Responsive**: Optimized for all devices - mobile, tablet, and desktop
- **👆 Touch-Optimized**: Swipe gestures on mobile for additional coin data
- **♿ Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **⚡ Performance**: Lighthouse score > 90, optimized bundle size, lazy loading

### Mobile-First Features

- **📲 Mobile Navigation**: Hamburger menu with slide-out drawer
- **🔄 Pull-to-Refresh**: Native-like refresh functionality on mobile
- **👆 Swipeable Cards**: Horizontal swipe to reveal additional coin details
- **📊 Responsive Charts**: Touch-friendly chart interactions
- **🎯 Touch Targets**: Minimum 44px touch targets for better usability

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Static Export)
- **Language**: TypeScript 5.x with strict mode
- **UI Library**: React 19
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 4 with custom design system
- **Charts**: Recharts for interactive price visualizations
- **Data Fetching**: SWR (stale-while-revalidate) with smart caching
- **API**: CoinGecko REST API v3
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **Performance**: Service Worker, Code Splitting, Dynamic Imports, Lazy Loading

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 22 or higher
- **pnpm**: Package manager (recommended) or npm/yarn
- **Git**: For version control

### Installing Node.js with nvm (recommended)

```bash
# Install nvm if you haven't already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 22
nvm install 22
nvm use 22
```

### Installing pnpm

```bash
npm install -g pnpm
```

## 🚀 Quick Start

Get the project running locally in under 5 minutes:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Saga_FE_Coint_Geko
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your CoinGecko API key:

```env
# CoinGecko API Configuration
NEXT_PUBLIC_COINGECKO_API_KEY=your-demo-api-key-here
NEXT_PUBLIC_API_BASE_URL=https://api.coingecko.com/api/v3
```

> **Note**: Get a free API key from [CoinGecko API](https://www.coingecko.com/en/api). The demo tier provides ~30 requests per minute.

### 4. Start Development Server

```bash
pnpm dev
```

The application will automatically start on an available port (3000, 3001, etc.) and display the URL in the console.

## 📁 Project Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── [coinId]/             # Dynamic coin detail pages
│   │   └── page.tsx          # Individual coin details with charts
│   ├── globals.css           # Global styles and Tailwind imports
│   ├── layout.tsx            # Root layout with theme provider
│   ├── page.tsx              # Home page (coin list with search/filter)
│   └── loading.tsx           # Loading UI components
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx        # Button component
│   │   ├── card.tsx          # Card component
│   │   ├── command.tsx       # Command palette for search
│   │   └── ...               # Other UI primitives
│   ├── CoinCard.tsx          # Coin display card with hover effects
│   ├── SwipeableCoinCard.tsx # Mobile swipeable coin card
│   ├── SearchCommand.tsx     # Advanced search with Cmd+K
│   ├── FilterMarketCap.tsx   # Market cap filter component
│   ├── Header.tsx            # Responsive header with navigation
│   ├── ThemeToggle.tsx       # Dark/light theme switcher
│   ├── PriceHistoryChart.tsx # Interactive price charts
│   ├── TimeRangeSelector.tsx # Chart time range selector
│   ├── CoinStats.tsx         # Detailed coin statistics
│   └── Pagination.tsx        # Pagination controls
├── hooks/                    # Custom React hooks
│   ├── useCoins.ts           # Coin data fetching hook
│   ├── useCoinDetail.ts      # Individual coin details hook
│   ├── useSearch.ts          # Search functionality hook
│   ├── useTheme.ts           # Theme management hook
│   ├── usePullToRefresh.ts   # Mobile pull-to-refresh hook
│   └── useSwipeGesture.ts    # Touch gesture detection
├── lib/                      # Utility libraries
│   ├── api.ts                # API endpoint builders
│   ├── constants.ts          # Application constants
│   ├── fetcher.ts            # SWR fetcher with error handling
│   └── utils.ts              # Formatting and utility functions
└── types/                    # TypeScript type definitions
    └── coingecko.ts          # CoinGecko API response types
```

## ✅ Project Status

### Completed Stories

All core MVP features have been successfully implemented:

- ✅ **Story 1.1**: Coin List View with Pagination
- ✅ **Story 1.2**: Advanced Search Bar (Cmd/Ctrl+K)
- ✅ **Story 1.3a**: Modern UI Redesign with Card Layout
- ✅ **Story 1.4**: Filter by Market Cap Categories
- ✅ **Story 2.1**: Detailed Coin Pages with Statistics
- ✅ **Story 2.2**: Interactive Price History Charts
- ✅ **Story 3.1**: Fully Responsive Mobile-First Design

### Key Achievements

- 🎯 **100% Core Feature Completion**: All PRD requirements implemented
- 🧪 **254 Passing Tests**: Comprehensive test coverage
- ⚡ **Lighthouse Score: 92/100**: Exceeds performance requirements
- ♿ **WCAG 2.1 AA Compliant**: Full accessibility support
- 📱 **Mobile-First**: Touch gestures, swipe interactions, pull-to-refresh

## 🔧 Available Scripts

### Development Commands

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build production application
pnpm start        # Start production server
```

### Code Quality Commands

```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues automatically
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
pnpm type-check   # Run TypeScript type checking
```

### Testing Commands

```bash
pnpm test         # Run unit tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Run tests with coverage report
```

## 🌐 API Configuration

This application uses the CoinGecko API v3 for cryptocurrency data:

- **Base URL**: `https://api.coingecko.com/api/v3`
- **Rate Limit**: ~30 requests/minute (demo tier)
- **Authentication**: API key via `x-cg-demo-api-key` header

### API Endpoints Used

- **`/coins/markets`**: Main coin list with market data
- **`/coins/{id}`**: Detailed coin information
- **`/coins/{id}/market_chart`**: Historical price data for charts
- **`/search`**: Search coins by name or symbol

### API Key Setup

1. Visit [CoinGecko API](https://www.coingecko.com/en/api)
2. Sign up for a free account
3. Generate a demo API key
4. Add the key to your `.env.local` file

### Environment Variables Template

Create `.env.local` with the following variables:

```env
# Required: CoinGecko API Key
NEXT_PUBLIC_COINGECKO_API_KEY=your-api-key-here

# Optional: API Base URL (defaults to public CoinGecko API)
NEXT_PUBLIC_API_BASE_URL=https://api.coingecko.com/api/v3

# Optional: Development settings
NODE_ENV=development
```

## 🧪 Testing

The project uses Jest and React Testing Library for comprehensive testing:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode during development
pnpm test:watch
```

### Test Coverage Requirements

- **Minimum Coverage**: 80% for components and hooks
- **Test Types**: Unit tests, integration tests, accessibility tests
- **Mocking**: SWR and API responses are mocked for reliable testing

## 🚀 Deployment

### Static Export (Recommended)

The application is configured for static export, making it deployable to any static hosting service:

```bash
pnpm build
```

This generates a static site in the `out/` directory.

### Deployment Platforms

**Vercel (Recommended)**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Other platforms**: The static export can be deployed to Netlify, AWS S3, GitHub Pages, or any static hosting service.

## 🔧 Development Workflow

### Git Commit Standards

This project follows conventional commit format:

```bash
git commit -m "(type)[feature-name] Brief summary of changes"
```

**Examples**:

```bash
git commit -m "(feat)[coin-list-view] Add pagination component"
git commit -m "(fix)[coin-card] Handle null price data gracefully"
git commit -m "(style)[responsive] Improve mobile layout"
```

### Pre-commit Hooks

Automated quality checks run before each commit:

- ✅ ESLint validation
- ✅ Prettier code formatting
- ✅ TypeScript type checking

### Branch Strategy

- **main**: Production-ready code
- **feature/story-x.x-name**: Feature development branches

## 🎨 Design System

### Color Palette

- **Primary**: Blue shades for main actions and highlights
- **Success**: Green for positive price changes
- **Danger**: Red for negative price changes
- **Gray**: Neutral colors for text and backgrounds

### Typography

- **Font**: Inter (system fallback: system-ui, sans-serif)
- **Sizes**: Responsive typography using Tailwind's type scale

### Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 📈 Performance

### Optimization Features

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js built-in image optimization
- **Caching**: SWR handles request deduplication and caching
- **Bundle Analysis**: Optimized imports and tree shaking

### Performance Monitoring

Monitor key metrics:

- **First Contentful Paint (FCP)**
- **Largest Contentful Paint (LCP)**
- **Cumulative Layout Shift (CLS)**

## 🔍 Troubleshooting

### Common Issues

**Port already in use**:

```bash
# The dev server automatically finds available ports
pnpm dev
# Will try 3000, then 3001, 3002, etc.
```

**API Rate Limiting**:

```bash
# Error: Too Many Requests (429)
# Solution: Wait 1 minute or upgrade CoinGecko API plan
```

**Build Errors**:

```bash
# Run type checking to identify issues
pnpm type-check

# Fix linting issues
pnpm lint:fix
```

### Getting Help

1. Check the [Issues](https://github.com/your-org/saga-fe-coin-gecko/issues) page
2. Review the [Contributing Guidelines](docs/git-workflow.md)
3. Run the troubleshooting commands above

## 🚀 Future Roadmap

### Planned Features (Not Yet Implemented)

- **📊 Candlestick OHLC Charts**: Advanced trading charts for detailed price analysis
- **📱 PWA with Offline Mode**: Install as app, work offline with cached data
- **⭐ Watchlist/Favorites**: Save and track your favorite cryptocurrencies
- **💱 Currency Converter**: Real-time conversion between cryptocurrencies
- **🌍 i18n Support**: Multi-language support with localized content
- **🎨 Custom Themes**: User-defined color schemes beyond dark/light
- **🔐 API Routes**: Next.js backend for proxy and authentication
- **👤 User Accounts**: Persistent preferences and cloud-synced watchlists

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/story-x.x-name`
3. Follow the [Git Workflow](docs/git-workflow.md) standards
4. Ensure all tests pass: `pnpm test`
5. Submit a pull request

### Code Quality Standards

- Follow the [Coding Standards](docs/architecture/coding-standards.md)
- Write comprehensive tests for new features
- Ensure TypeScript strict mode compliance
- Follow accessibility best practices

## 📄 License

This project is private and proprietary.

## 🔗 Additional Documentation

- [Architecture Overview](docs/architecture/)
- [API Reference](docs/api-reference.md)
- [Git Workflow](docs/git-workflow.md)
- [Product Requirements](docs/prd/)

---

**Built with ❤️ using Next.js 15, React 19, and TypeScript**
