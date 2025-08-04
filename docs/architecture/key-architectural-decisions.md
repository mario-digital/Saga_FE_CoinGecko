# 💡 Key Architectural Decisions

- **Client-side only**: Simplifies deployment, reduces SSR complexity
- **SWR over React Query**: Lightweight, perfect for read-heavy UIs
- **Composable hooks**: Encapsulate fetch + state in custom hooks
- **Atomic components**: Small UI building blocks, Tailwind-driven
- **Static export**: Fast CDN delivery, Next.js `output: export`
- **Minimal state management**: Avoid Redux/Jotai unless global state grows
