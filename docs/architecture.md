# 🧱 Architecture Overview – CoinGecko SPA

## 🧭 High-Level Architecture

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

## 🧩 Technologies

- **Framework**: Next.js 15 (App Router, Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR (stale-while-revalidate)
- **API**: CoinGecko (with key)
- **Charting**: Chart.js (via react-chartjs-2)
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
- **Composable hooks**: Encapsulate fetch + state in custom hooks
- **Atomic components**: Small UI building blocks, Tailwind-driven
- **Static export**: Fast CDN delivery, Next.js `output: export`
- **Minimal state management**: Avoid Redux/Jotai unless global state grows

## 🚧 Scalability Notes

- Can evolve into PWA with service workers
- If state grows, Jotai is the preferred state manager
- Dynamic routing and pagination can scale via query params
- If SEO becomes critical, add hybrid SSR for `/[coinId]`

## ✅ Summary

This architecture emphasizes simplicity, modularity, and performance. It’s designed to show modern SPA practices using React + Next 15, with scalable paths to grow into more complex use cases.
