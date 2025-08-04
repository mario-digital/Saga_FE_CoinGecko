# 🔌 API Integration

- Base URL: `https://api.coingecko.com/api/v3`
- Headers: `x-cg-demo-api-key` from `.env.local`
- Rate Limit: ~30 req/min (demo tier)
- Strategy: Cache coin lists, fetch details per ID on-demand
