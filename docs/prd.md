# 📝 Product Requirements Document (PRD) – CoinGecko SPA

## 📌 Project Overview & Goals

This project is a single-page application (SPA) built with **React**, **Next.js**, and **TypeScript** that fetches cryptocurrency data from the **CoinGecko** public API via **client-side requests**. It is designed for **static deployment** (CDN-ready, no SSR/API routes) to demonstrate modern React practices: reusable components, custom hooks, state management, responsive UI, error handling, and basic testing.

### Primary Goals

- **Static deployment**: Next.js SSG-ready build, no SSR/API routes (except static generation).
- **Clean architecture**: Components for UI; hooks for data/state (separation of concerns).
- **Interactive features**: Search/filter, pagination, selectable history ranges, theme toggle.
- **Resilience**: Inline, user-friendly error states; graceful loading.
- **Quality**: Jest + RTL unit tests (hooks/components) and Cypress E2E smoke.
- **Documentation**: Clear README with setup, decisions (incl. feature matrix), and run instructions.

### Out of Scope (for v1)

- Server-side rendering, Next.js API routes, authentication, write operations.
- PWA/offline and candlestick charts (deferred).
- Complex theming beyond light/dark toggle.

### Success Criteria

- Deployed static site renders quickly on mobile/desktop with Lighthouse-friendly scores.
- Users can browse coins, filter/search, paginate, view details, and switch history ranges.
- Tests pass in CI; README enables a new dev to run locally within minutes.

---

## 🧩 Core Features

1. **Coin List View** – Paginated display of top cryptocurrencies with name, symbol, price, market cap, and 24h change.
2. **Search and Filter** – Instant search by coin name/symbol and filter by market cap (e.g. Top 10, Top 50).
3. **Coin Detail View** – On selection, show detailed data including sparkline chart, price range, volume, and links.
4. **Selectable History Range** – User can select 7d/30d/90d/365d chart range (dynamic fetch using CoinGecko `days` param).
5. **Dark/Light Theme Toggle** – UI toggle with persistence via localStorage.
6. **Error and Loading States** – Inline handling for loading and API errors with contextual messaging.
7. **Responsive UI** – Fully functional on mobile and desktop.
8. **Testing and Documentation** – Key flows covered with tests; feature matrix and decisions documented.

---

## 👥 Target Users

- **Developers & Interviewers** – Reviewing the repo for React/Next.js proficiency, clean architecture, testing, and code clarity.
- **Technical Recruiters** – Evaluating frontend competency and project organization at a glance.
- **Crypto Enthusiasts** – Casual users interested in browsing top coins and trends.
- **Self-assessment** – The author will use this to demonstrate best practices and iterate based on feedback.

---

## 🎨 Design & UX Principles

- **Mobile-first Responsive Design**
- **Minimal Distractions** – Clean data-focused UI.
- **Accessibility Considerations** – Semantic HTML, focus states, ARIA labels.
- **Loading & Error Feedback** – Inline spinners and graceful error UI.
- **Consistent Component Behavior** – Predictable, modular UI pieces.
- **Theme Toggle** – Light/Dark mode persisted via localStorage.

---

## 🧱 Technical Stack

### Frontend

- `React 19` with new `use` async hook support
- `Next.js 15` App Router using SSG only
- `TypeScript`

### UI

- `Tailwind CSS`
- `Heroicons` or `Lucide`

### Data & State

- `SWR` for remote data caching
- Local state via `useState`/`useReducer`
- [No Redux or Jotai unless complexity grows]

### Charts

- `react-chartjs-2` or `Recharts`

### Testing

- `Jest` + `React Testing Library`
- `Cypress` for E2E

### Deployment

- `pnpm` or `yarn`
- Hosted on `Vercel`
- `.env.local` for storing CoinGecko API key

---

## 🔧 Non-Functional Requirements

- **Static Deployment** via `next export`
- **Lighthouse score ≥ 90 (mobile)**
- **WCAG AA accessibility**
- **Mobile-first design**
- **>80% test coverage**
- **≤ 250 KB gzipped JS bundle**
- **CI-ready build time < 2 minutes**
- **Setup time for new dev ≤ 5 min**

---

## 📈 Success Metrics

### Technical

- Static build + deploy success
- Lighthouse ≥ 90 mobile
- 80%+ test coverage
- Passing smoke tests
- Lightweight bundle
- Clean Git history

### Dev Experience

- Setup in under 5 minutes
- Clear folder structure
- No major TS/ESLint issues

### Reviewer Goals

- Feels professional
- Shows judgment in scope, structure, and design

---

## ⚠️ Known Risks & Assumptions

### Risks

- CoinGecko Demo plan limit ~30 reqs/min
- API key now required
- Chart library may bloat bundle
- Tailwind layout bugs possible
- Testing time could slip if bugs arise

### Assumptions

- Free CoinGecko API key is stable
- No auth or write logic in v1
- Static export is sufficient
- Vercel or CDN hosting assumed

---

## 🌱 Future Opportunities

- Candlestick OHLC charts
- PWA with offline mode
- Watchlist/favorites (local or persistent)
- Currency converter
- i18n support
- Custom themes
- Next.js API routes (for proxy/auth)
- User accounts
