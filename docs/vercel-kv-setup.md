# Vercel KV Setup Guide

## Overview

This project uses Vercel KV (Redis) as a persistent cache layer to prevent API rate limits and improve performance.

## Architecture

Two-tier caching system:

1. **LRU Cache** (in-memory): Fast, ephemeral
2. **Vercel KV** (Redis): Persistent across deployments

Cache flow: `Request → LRU → KV → CoinGecko API`

## Setup Instructions

### 1. Create Vercel KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard/stores)
2. Click "Create Database" → Select "KV"
3. Choose a name (e.g., `saga-cache`)
4. Select region closest to your deployment
5. Click "Create"

### 2. Get Environment Variables

After creating the database:

1. Click on your KV database
2. Go to "Settings" tab
3. Copy all environment variables

### 3. Local Development Setup

#### Option A: Automatic (Recommended)

```bash
# Pull env vars from Vercel
vercel env pull .env.local
```

#### Option B: Manual

1. Copy `.env.local.example` to `.env.local`
2. Replace placeholder values with your KV credentials:

```env
KV_URL=redis://default:xxx@xxx.kv.vercel-storage.com:xxx
KV_REST_API_URL=https://xxx.kv.vercel-storage.com
KV_REST_API_TOKEN=xxx
KV_REST_API_READ_ONLY_TOKEN=xxx
```

### 4. Verify Connection

Start dev server and check console:

```bash
pnpm dev
```

You should see:

```
✅ Vercel KV connected successfully
```

Or if not configured:

```
ℹ️ Vercel KV not configured, using in-memory cache only
```

## Usage

### Cache Stats Dashboard

View cache performance at: http://localhost:3000/api/cache/dashboard

Stats include:

- LRU hit rate
- KV hit rate
- Total cache hits/misses
- Request distribution

### API Response Headers

Check cache status in response headers:

- `X-Cache: HIT` - Data from cache
- `X-Cache: MISS` - Fresh from API
- `X-Cache: STALE` - Stale data during error

## Free Tier Limits

**Vercel KV Free Tier:**

- 3,000 requests/day
- 256 MB storage
- 1 database

**Usage Breakdown:**

- Each `get` = 1 request
- Each `set` = 1 request
- ~100 requests/hour for development

## Monitoring

### Vercel Dashboard

Monitor usage at: https://vercel.com/dashboard/stores/[your-kv-name]

Shows:

- Request count
- Storage used
- Cache keys
- Performance metrics

### Local Dashboard

http://localhost:3000/api/cache/stats

Returns:

```json
{
  "cache": {
    "lruHits": 150,
    "kvHits": 75,
    "misses": 25
  },
  "kv": {
    "dbSize": 47,
    "available": true
  }
}
```

## Troubleshooting

### KV Not Connecting

1. Check env variables are set
2. Verify KV database is active in Vercel Dashboard
3. Check network connectivity

### Rate Limits Still Occurring

1. Check if KV is connected (see stats)
2. Verify cache TTLs are appropriate
3. Monitor KV request count

### Cache Not Persisting

1. Ensure both LRU and KV are being populated
2. Check for KV write errors in console
3. Verify TTL values are being set

## Performance Tips

1. **Cache TTLs:**
   - Coin lists: 2 minutes
   - Coin details: 5 minutes
   - Price history: 15 minutes

2. **Optimization:**
   - LRU serves ~45% of requests (instant)
   - KV serves ~40% of requests (20-50ms)
   - API calls only ~15% (rate limited)

3. **Cost Management:**
   - Monitor daily request count
   - Adjust TTLs if approaching limits
   - Consider upgrading for production

## Production Deployment

Vercel automatically injects KV env variables in production - no manual setup needed!

Just ensure:

1. KV database is created
2. Project is linked to Vercel
3. Deploy normally

Cache will persist across deployments! 🎉
