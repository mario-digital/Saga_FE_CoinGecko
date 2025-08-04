# 🧱 Architecture Overview – CoinGecko SPA

## 🧭 High-Level Architecture

```
Next.js (App Router) + shadcn/ui Design System
├── Pages (Static Routes)
│   ├── / (Home - Coin List Grid)
│   ├── /[coinId] (Coin Detail + Chart)
├── Components (shadcn/ui + Custom)
│   ├── ui/ (shadcn/ui primitives)
│   │   ├── card.tsx
│   │   ├── command.tsx (search)
│   │   ├── pagination.tsx
│   │   ├── skeleton.tsx (loading)
│   │   ├── chart.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── button.tsx
│   │   ├── alert.tsx (errors)
│   │   └── tabs.tsx (chart ranges)
│   ├── CoinCard.tsx (shadcn Card + custom)
│   ├── CoinDetail.tsx (Chart + Stats Grid)
│   ├── SearchCommand.tsx (shadcn Command)
│   ├── PriceChart.tsx (shadcn Chart)
│   ├── ThemeToggle.tsx
│   └── LoadingStates.tsx (shadcn Skeleton)
├── Hooks
│   ├── useCoins.ts
│   ├── useCoinDetail.ts
│   └── useTheme.ts
├── Lib
│   ├── fetcher.ts (SWR fetch wrapper)
│   ├── api.ts (API endpoint utils)
│   └── utils.ts (cn helper + shadcn utils)
├── Styles
│   ├── globals.css (shadcn + Tailwind)
│   └── components.css
├── Tests
│   ├── unit/ (Jest + RTL)
│   ├── e2e/ (Cypress)
├── Public
├── .env.local
└── components.json (shadcn config)
```

## 🧩 Technologies

- **Framework**: Next.js 15 (App Router, Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui Design System
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React (shadcn/ui compatible)
- **Data Fetching**: SWR (stale-while-revalidate)
- **API**: CoinGecko (with key)
- **Charting**: shadcn/ui Chart (Recharts-based)
- **Testing**: Jest, React Testing Library, Cypress
- **Deployment**: Vercel

## 📦 Folder Structure

```
/src
├── app
│   ├── page.tsx (Home)
│   ├── [coinId]/page.tsx (Detail)
├── components
├── hooks
├── lib
├── styles
├── tests
```

## 🔌 API Integration

- Base URL: `https://api.coingecko.com/api/v3`
- Headers: `x-cg-demo-api-key` from `.env.local`
- Rate Limit: ~30 req/min (demo tier)
- Strategy: Cache coin lists, fetch details per ID on-demand

## 💡 Key Architectural Decisions

- **Client-side only**: Simplifies deployment, reduces SSR complexity
- **SWR over React Query**: Lightweight, perfect for read-heavy UIs
- **shadcn/ui Design System**: Consistent, accessible components with Radix primitives
- **Component composition**: shadcn/ui cards + custom crypto logic
- **Composable hooks**: Encapsulate fetch + state in custom hooks
- **Static export**: Fast CDN delivery, Next.js `output: export`
- **Minimal state management**: Avoid Redux/Jotai unless global state grows
- **Progressive loading**: Skeleton states for all async content
- **Accessibility-first**: WCAG AA compliance via shadcn/ui + testing

## 🧩 Component Architecture Mapping

### Core Components (shadcn/ui + Custom Logic)

#### CoinCard Component

- **Base**: shadcn/ui `Card`, `CardHeader`, `CardContent`
- **Features**: Hover states, loading skeletons, price change badges
- **States**: Default, Loading (Skeleton), Error, Hover
- **Responsive**: 4-col → 2-col → 1-col grid

#### SearchCommand Component

- **Base**: shadcn/ui `Command`, `CommandInput`, `CommandList`
- **Features**: Cmd+K shortcut, real-time search, filter integration
- **Variants**: Overlay (desktop), Sheet (mobile)
- **Accessibility**: Full keyboard navigation, ARIA labels

#### PriceChart Component

- **Base**: shadcn/ui `Chart` (Recharts wrapper)
- **Features**: Time range tabs, interactive tooltips, responsive design
- **Variants**: Sparkline (cards), Full chart (detail view)
- **Fallbacks**: Price data table when chart unavailable

#### Pagination Component

- **Base**: shadcn/ui `Pagination`
- **Features**: Smooth scroll to top, URL params sync
- **Accessibility**: Screen reader announcements, keyboard navigation

#### Loading States

- **Base**: shadcn/ui `Skeleton`
- **Variants**: Card skeleton, Chart skeleton, List skeleton
- **Features**: Matches exact component dimensions

### Layout Components

#### Header

- **Components**: `Input` (search), `Button` (theme toggle)
- **Features**: Responsive search, theme persistence
- **Mobile**: Collapsible search, touch-friendly targets

#### Error States

- **Base**: shadcn/ui `Alert`, `AlertDescription`
- **Variants**: Network error, API error, 404 error
- **Features**: Retry buttons, helpful error messages

## 🎨 Design System Integration

### shadcn/ui Configuration

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Required shadcn/ui Components

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add command
npx shadcn-ui@latest add chart
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add pagination
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add breadcrumb
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
```

### Theme Configuration

- **Colors**: Extend default palette with crypto-specific colors
- **Success**: Green for positive price changes
- **Destructive**: Red for negative price changes
- **Muted**: Gray for secondary information
- **Typography**: Inter font (consistent with design spec)

## ♿ Accessibility Architecture

### WCAG AA Compliance Strategy

- **shadcn/ui Foundation**: Built-in Radix primitives ensure base accessibility
- **Color Contrast**: 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Management**: Visible focus indicators, logical tab order
- **Screen Readers**: ARIA labels, live regions for price updates
- **Keyboard Navigation**: Full keyboard support for all interactions

### Testing Strategy

- **Automated**: axe-core integration in Jest tests
- **Manual**: Keyboard navigation testing
- **Screen Reader**: NVDA/VoiceOver testing for financial data

### Responsive Design Architecture

- **Mobile-First**: Start with mobile constraints, enhance for desktop
- **Breakpoints**: 320px, 768px, 1024px, 1440px
- **Touch Targets**: Minimum 44px on mobile
- **Content Priority**: Hide secondary data on small screens

## 🚧 Scalability Notes

- Can evolve into PWA with service workers
- If state grows, Jotai is the preferred state manager
- Dynamic routing and pagination can scale via query params
- If SEO becomes critical, add hybrid SSR for `/[coinId]`
- shadcn/ui components can be extended/customized without breaking changes
- Chart component can upgrade to more advanced charting if needed

## ✅ Summary

This architecture combines Next.js 15 with shadcn/ui design system to create a scalable, accessible, and maintainable cryptocurrency application. The component-driven approach ensures consistency while the shadcn/ui foundation provides enterprise-grade accessibility and user experience patterns.
