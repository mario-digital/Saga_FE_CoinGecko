# 🧭 High-Level Architecture

```
Next.js (App Router)
├── Pages (Static Routes)
│   ├── / (Home - Coin List)
│   ├── /[coinId] (Coin Detail)
├── Components
│   ├── CoinCard.tsx
│   ├── CoinDetail.tsx
│   ├── SearchBar.tsx
│   ├── Pagination.tsx
│   ├── ThemeToggle.tsx
├── Hooks
│   ├── useCoins.ts
│   ├── useCoinDetail.ts
├── Lib
│   ├── fetcher.ts (SWR fetch wrapper)
│   ├── api.ts (API endpoint utils)
├── Styles (TailwindCSS)
├── Tests
│   ├── unit/ (Jest + RTL)
│   ├── e2e/ (Cypress)
├── Public
├── .env.local
```
