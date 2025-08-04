# Saga FE Coin Gecko

A modern cryptocurrency market data viewer built with Next.js 15, React 19, and TypeScript. This application provides real-time cryptocurrency prices, market capitalizations, and trading volumes with a responsive, accessible interface.

## 🚀 Features

- **Real-time Crypto Data**: Live prices and market data from CoinGecko API
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Pagination**: Browse through thousands of cryptocurrencies
- **Performance Optimized**: Built with Next.js 15 and React 19
- **Type Safety**: Full TypeScript integration with strict typing
- **Modern UI**: Clean, accessible interface with Tailwind CSS

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Static Export)
- **Language**: TypeScript 5.x with strict mode
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 with custom design tokens
- **Data Fetching**: SWR (stale-while-revalidate)
- **API**: CoinGecko REST API
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

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
│   ├── globals.css           # Global styles and Tailwind imports
│   ├── layout.tsx            # Root layout component
│   ├── page.tsx              # Home page (coin list)
│   └── loading.tsx           # Loading UI components
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   ├── CoinCard.tsx          # Individual coin display card
│   └── Pagination.tsx        # Pagination controls
├── hooks/                    # Custom React hooks
│   └── useCoins.ts           # Coin data fetching hook
├── lib/                      # Utility libraries
│   ├── api.ts                # API endpoint builders
│   ├── constants.ts          # Application constants
│   ├── fetcher.ts            # SWR fetcher with error handling
│   └── utils.ts              # Formatting and utility functions
└── types/                    # TypeScript type definitions
    └── coingecko.ts          # CoinGecko API response types
```

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

This application uses the CoinGecko API for cryptocurrency data:

- **Base URL**: `https://api.coingecko.com/api/v3`
- **Rate Limit**: ~30 requests/minute (demo tier)
- **Primary Endpoint**: `/coins/markets`

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
