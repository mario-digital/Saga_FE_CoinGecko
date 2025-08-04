# Coding Standards

This document outlines the coding standards and best practices for the Saga FE Coin Gecko project, built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [React Component Standards](#react-component-standards)
4. [Next.js Specific Standards](#nextjs-specific-standards)
5. [Code Organization](#code-organization)
6. [Naming Conventions](#naming-conventions)
7. [Error Handling](#error-handling)
8. [Performance Standards](#performance-standards)
9. [Testing Standards](#testing-standards)
10. [Code Quality Tools](#code-quality-tools)

## General Principles

### Code Quality
- Write clean, readable, and maintainable code
- Follow the principle of least surprise
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Avoid deep nesting (max 3 levels)
- Use early returns to reduce complexity

### TypeScript First
- Use TypeScript's strict mode (`"strict": true`)
- Prefer explicit typing over `any`
- Use `unknown` instead of `any` for API responses
- Leverage TypeScript's type inference when appropriate
- Use Type Guards instead of type assertions (`as`)

## TypeScript Standards

### Type Definitions

```typescript
// ✅ Good - Explicit interface definitions
interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

// ✅ Good - Union types for specific values
type SortOrder = 'asc' | 'desc';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ❌ Avoid - Using any
const data: any = {};

// ✅ Good - Use unknown for unknown data
const apiResponse: unknown = await fetch('/api/data');
```

### Function Typing

```typescript
// ✅ Good - Explicit parameter and return types
function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

// ✅ Good - Arrow function with types
const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  return ((newValue - oldValue) / oldValue) * 100;
};
```

### Utility Types

```typescript
// ✅ Good - Use built-in utility types
type PartialCoin = Partial<CoinData>;
type RequiredCoinFields = Pick<CoinData, 'id' | 'name' | 'current_price'>;
type CoinWithoutImage = Omit<CoinData, 'image'>;

// ✅ Good - Generic types for reusable components
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}
```

## React Component Standards

### Function Components

```typescript
// ✅ Good - Function component with explicit props interface
interface CoinCardProps {
  coin: CoinData;
  onClick?: (coinId: string) => void;
  className?: string;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, onClick, className }) => {
  return (
    <div className={className} onClick={() => onClick?.(coin.id)}>
      <h3>{coin.name}</h3>
      <p>{formatPrice(coin.current_price)}</p>
    </div>
  );
};

export default CoinCard;
```

### Hooks Usage

```typescript
// ✅ Good - Custom hook with proper typing
interface UseCoinsReturn {
  coins: CoinData[] | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useCoins = (page: number = 1, perPage: number = 50): UseCoinsReturn => {
  const { data, error, isLoading, mutate } = useSWR<CoinData[]>(
    `/api/coins?page=${page}&per_page=${perPage}`,
    fetcher
  );

  return {
    coins: data,
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
};

// ✅ Good - useState with union types
const [loadingState, setLoadingState] = useState<LoadingState>('idle');
const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

// ✅ Good - useCallback with proper typing
const handleCoinSelect = useCallback((coinId: string) => {
  const coin = coins?.find(c => c.id === coinId);
  setSelectedCoin(coin || null);
}, [coins]);
```

### Event Handling

```typescript
// ✅ Good - Proper event typing
const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(event.target.value);
};

const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  onSearch();
};
```

## Next.js Specific Standards

### App Router Structure

```typescript
// ✅ Good - Page component structure
export default function HomePage(): JSX.Element {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1>Cryptocurrency Market</h1>
      <CoinList />
    </main>
  );
}

// ✅ Good - Layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}
```

### API Routes

```typescript
// ✅ Good - API route with proper typing
import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '50';

    const data = await fetchCoins(parseInt(page), parseInt(perPage));
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch coins' },
      { status: 500 }
    );
  }
}
```

### Data Fetching

```typescript
// ✅ Good - SWR with proper error handling
const fetcher = async (url: string): Promise<CoinData[]> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
};
```

## Code Organization

### File Structure

```
src/
├── app/
│   ├── page.tsx                 # Home page
│   └── [coinId]/
│       └── page.tsx            # Dynamic coin detail page
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── CoinCard.tsx           # Feature-specific components
│   └── Pagination.tsx
├── hooks/
│   ├── useCoins.ts            # Custom hooks
│   └── usePagination.ts
├── lib/
│   ├── api.ts                 # API utilities
│   ├── fetcher.ts             # SWR fetcher
│   └── utils.ts               # General utilities
├── types/
│   └── coingecko.ts          # Type definitions
└── tests/
    ├── components/
    └── hooks/
```

### Import Organization

```typescript
// ✅ Good - Import order
// 1. React and Next.js imports
import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';

// 2. Third-party library imports
import useSWR from 'swr';
import clsx from 'clsx';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/Button';
import { useCoins } from '@/hooks/useCoins';
import { CoinData } from '@/types/coingecko';

// 4. Relative imports
import './CoinCard.module.css';
```

## Naming Conventions

### Variables and Functions
```typescript
// ✅ Good - camelCase for variables and functions
const coinPrice = 45000;
const isLoading = true;
const fetchCoinData = (): void => {};

// ✅ Good - Descriptive boolean names
const isAuthenticated = user !== null;
const hasError = error !== null;
const shouldShowLoader = isLoading && !data;
```

### Components and Types
```typescript
// ✅ Good - PascalCase for components and types
const CoinCard = (): JSX.Element => {};
interface UserPreferences {}
type ApiResponse<T> = {};

// ✅ Good - Descriptive component names
const CoinPriceChart = (): JSX.Element => {};
const NavigationHeader = (): JSX.Element => {};
```

### Constants
```typescript
// ✅ Good - SCREAMING_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const MAX_COINS_PER_PAGE = 100;
const DEFAULT_CURRENCY = 'usd';
```

### Files and Directories
```typescript
// ✅ Good - kebab-case for directories
// src/components/coin-card/
// src/hooks/use-pagination/

// ✅ Good - PascalCase for component files
// CoinCard.tsx
// PaginationControls.tsx

// ✅ Good - camelCase for utility files
// formatPrice.ts
// apiHelpers.ts
```

## Error Handling

### API Error Handling
```typescript
// ✅ Good - Comprehensive error handling
const useCoins = (page: number) => {
  const { data, error, isLoading } = useSWR(
    `/api/coins?page=${page}`,
    async (url: string) => {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }
      
      return response.json();
    }
  );

  return {
    coins: data,
    error: error?.message || null,
    isLoading,
  };
};
```

### Component Error Boundaries
```typescript
// ✅ Good - Error boundary for component isolation
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class CoinListErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): JSX.Element {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong loading the coin list.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Performance Standards

### Component Optimization
```typescript
// ✅ Good - React.memo for expensive components
const CoinCard = React.memo<CoinCardProps>(({ coin, onClick }) => {
  return (
    <div onClick={() => onClick(coin.id)}>
      {/* Component content */}
    </div>
  );
});

// ✅ Good - useMemo for expensive calculations
const sortedCoins = useMemo(() => {
  if (!coins) return [];
  
  return [...coins].sort((a, b) => {
    if (sortBy === 'price') {
      return sortOrder === 'asc' 
        ? a.current_price - b.current_price
        : b.current_price - a.current_price;
    }
    return 0;
  });
}, [coins, sortBy, sortOrder]);

// ✅ Good - useCallback for event handlers
const handleCoinClick = useCallback((coinId: string) => {
  router.push(`/coins/${coinId}`);
}, [router]);
```

### Data Fetching Optimization
```typescript
// ✅ Good - SWR configuration for performance
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 5000,
};

// ✅ Good - Pagination to limit data
const useCoins = (page: number, perPage: number = 50) => {
  return useSWR(
    `coins-page-${page}-${perPage}`,
    () => fetchCoins(page, perPage),
    swrConfig
  );
};
```

## Testing Standards

### Component Testing
```typescript
// ✅ Good - Component test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { CoinCard } from '@/components/CoinCard';
import { mockCoinData } from '@/tests/__mocks__/coinData';

describe('CoinCard', () => {
  it('renders coin information correctly', () => {
    render(<CoinCard coin={mockCoinData} />);
    
    expect(screen.getByText(mockCoinData.name)).toBeInTheDocument();
    expect(screen.getByText(/\$45,000/)).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<CoinCard coin={mockCoinData} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockCoinData.id);
  });
});
```

### Hook Testing
```typescript
// ✅ Good - Custom hook testing
import { renderHook, waitFor } from '@testing-library/react';
import { useCoins } from '@/hooks/useCoins';

// Mock SWR
jest.mock('swr');

describe('useCoins', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useCoins(1));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.coins).toBeUndefined();
  });
});
```

## Code Quality Tools

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-const": "error",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid"
}
```

### Git Hooks
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript type checking

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

## Conclusion

These coding standards ensure consistency, maintainability, and quality across the Saga FE Coin Gecko project. All team members should follow these guidelines and update them as the project evolves.

For questions or suggestions regarding these standards, please create an issue in the project repository.