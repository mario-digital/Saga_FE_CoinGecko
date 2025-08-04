# Source Tree Structure

This document outlines the directory structure and organization of the Saga FE Coin Gecko project.

## Project Root

```
Saga_FE_Coint_Geko/
├── .bmad-core/                 # BMad agent configuration
├── .claude/                    # Claude Code configuration
├── docs/                       # Project documentation
│   ├── architecture/           # Architecture documentation
│   ├── prd/                   # Product requirements
│   └── stories/               # User stories
├── src/                       # Source code
├── public/                    # Static assets
├── .env.local                 # Local environment variables
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── jest.config.js           # Jest testing configuration
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── pnpm-lock.yaml          # pnpm lock file
├── README.md               # Project overview and setup
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Source Directory (`src/`)

```
src/
├── app/                       # Next.js App Router pages
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout component
│   ├── page.tsx              # Home page (coin list)
│   ├── loading.tsx           # Global loading UI
│   ├── error.tsx             # Global error UI
│   └── [coinId]/             # Dynamic coin detail pages
│       ├── page.tsx          # Coin detail page
│       ├── loading.tsx       # Coin detail loading
│       └── error.tsx         # Coin detail error
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   │   ├── Button.tsx        # Button component
│   │   ├── Card.tsx          # Card component
│   │   ├── Input.tsx         # Input component
│   │   ├── LoadingSpinner.tsx # Loading spinner
│   │   └── ErrorMessage.tsx  # Error display component
│   ├── CoinCard.tsx          # Individual coin display card
│   ├── CoinList.tsx          # Coin list container
│   ├── Pagination.tsx        # Pagination controls
│   ├── SearchBar.tsx         # Search functionality
│   └── Header.tsx            # Application header
├── hooks/                    # Custom React hooks
│   ├── useCoins.ts           # Coin data fetching hook
│   ├── usePagination.ts      # Pagination logic hook
│   ├── useSearch.ts          # Search functionality hook
│   └── useLocalStorage.ts    # Local storage helper hook
├── lib/                      # Utility libraries
│   ├── api.ts                # API configuration and helpers
│   ├── fetcher.ts            # SWR fetcher function
│   ├── utils.ts              # General utility functions
│   ├── formatters.ts         # Data formatting utilities
│   └── constants.ts          # Application constants
├── types/                    # TypeScript type definitions
│   ├── coingecko.ts          # CoinGecko API response types
│   ├── api.ts                # General API types
│   └── common.ts             # Common/shared types
└── styles/                   # Additional styles
    ├── components.css        # Component-specific styles
    └── utilities.css         # Custom utility classes
```

## Test Directory Structure

```
src/
├── __tests__/                # Global test utilities
│   ├── __mocks__/            # Test mocks
│   │   ├── coinData.ts       # Mock coin data
│   │   └── apiResponses.ts   # Mock API responses
│   └── setup.ts              # Test setup configuration
├── components/
│   ├── __tests__/            # Component tests
│   │   ├── CoinCard.test.tsx
│   │   ├── Pagination.test.tsx
│   │   └── ui/
│   │       ├── Button.test.tsx
│   │       └── Card.test.tsx
├── hooks/
│   ├── __tests__/            # Hook tests
│   │   ├── useCoins.test.ts
│   │   └── usePagination.test.ts
└── lib/
    └── __tests__/            # Utility tests
        ├── formatters.test.ts
        └── utils.test.ts
```

## Documentation Structure (`docs/`)

```
docs/
├── architecture/             # Technical architecture
│   ├── api-integration.md    # API integration details
│   ├── coding-standards.md   # Code quality standards
│   ├── folder-structure.md   # Directory organization
│   ├── high-level-architecture.md # System overview
│   ├── key-architectural-decisions.md # Design decisions
│   ├── scalability-notes.md  # Scaling considerations
│   ├── source-tree.md        # This file
│   ├── summary.md            # Architecture summary
│   ├── tech-stack.md         # Technology choices
│   └── technologies.md       # Technology overview
├── prd/                      # Product requirements
│   ├── core-features.md      # Feature specifications
│   ├── design-ux-principles.md # Design guidelines
│   ├── epic-*.md             # Epic definitions
│   ├── project-overview-goals.md # Project objectives
│   └── technical-stack.md    # Technical requirements
└── stories/                  # User stories
    ├── 1.1.coin-list-view.md # Coin list implementation
    └── *.md                  # Additional stories
```

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured (`@/` → `src/`)
- Next.js optimizations
- Absolute imports support

### Next.js Configuration (`next.config.js`)
- Static export configuration
- Image optimization settings
- Experimental features (if needed)
- Port handling for development

### Tailwind Configuration (`tailwind.config.js`)
- Content paths for purging
- Custom theme extensions
- Plugin configurations
- Design system tokens

### ESLint Configuration (`.eslintrc.json`)
- Next.js recommended rules
- TypeScript integration
- React hooks rules
- Custom project rules

### Prettier Configuration (`.prettierrc`)
- Code formatting rules
- Consistent style enforcement
- Integration with ESLint

## Asset Organization

```
public/
├── images/                   # Static images
│   ├── logo.svg              # Application logo
│   ├── icons/                # Icon assets
│   └── placeholders/         # Placeholder images
├── favicon.ico               # Browser favicon
├── robots.txt                # SEO robot instructions
└── sitemap.xml               # Site map for SEO
```

## Environment Configuration

### Local Development (`.env.local`)
```
NEXT_PUBLIC_COINGECKO_API_KEY=your-demo-api-key
NEXT_PUBLIC_API_BASE_URL=https://api.coingecko.com/api/v3
NODE_ENV=development
```

### Production Environment
- Environment variables managed through deployment platform
- API keys secured through platform secrets
- Build-time optimizations enabled

## Build Artifacts (Generated)

```
.next/                        # Next.js build output
out/                         # Static export output (when using export)
node_modules/                # Installed dependencies
coverage/                    # Test coverage reports
.pnpm-store/                # pnpm package cache
```

## Development Workflow Directories

```
.git/                        # Git version control
.github/                     # GitHub configuration
├── workflows/               # CI/CD workflows
└── ISSUE_TEMPLATE.md       # Issue templates
```

This structure promotes:
- **Separation of Concerns**: Clear boundaries between different types of code
- **Scalability**: Easy to add new features and components
- **Maintainability**: Consistent organization and naming
- **Testing**: Co-located tests with source code
- **Documentation**: Comprehensive project documentation
- **Development Experience**: Logical structure for easy navigation