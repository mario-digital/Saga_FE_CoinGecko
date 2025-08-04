# 📌 Project Overview & Goals

This project is a single-page application (SPA) built with **React**, **Next.js**, and **TypeScript** that fetches cryptocurrency data from the **CoinGecko** public API via **client-side requests**. It is designed for **static deployment** (CDN-ready, no SSR/API routes) to demonstrate modern React practices: reusable components, custom hooks, state management, responsive UI, error handling, and basic testing.

## Primary Goals

- **Static deployment**: Next.js SSG-ready build, no SSR/API routes (except static generation).
- **Clean architecture**: Components for UI; hooks for data/state (separation of concerns).
- **Interactive features**: Search/filter, pagination, selectable history ranges, theme toggle.
- **Resilience**: Inline, user-friendly error states; graceful loading.
- **Quality**: Jest + RTL unit tests (hooks/components) and Cypress E2E smoke.
- **Documentation**: Clear README with setup, decisions (incl. feature matrix), and run instructions.

## Out of Scope (for v1)

- Server-side rendering, Next.js API routes, authentication, write operations.
- PWA/offline and candlestick charts (deferred).
- Complex theming beyond light/dark toggle.

## Success Criteria

- Deployed static site renders quickly on mobile/desktop with Lighthouse-friendly scores.
- Users can browse coins, filter/search, paginate, view details, and switch history ranges.
- Tests pass in CI; README enables a new dev to run locally within minutes.
