# Vercel Deployment Guide

## Prerequisites

- GitHub repository connected to Vercel
- Vercel account (free tier is sufficient)
- Environment variables configured in Vercel dashboard

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mario-digital/Saga_FE_Coin_Geko)

## Manual Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository: `mario-digital/Saga_FE_Coin_Geko`

### 2. Configure Build Settings

The project includes a `vercel.json` configuration file with optimal settings:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 3. Set Environment Variables

In the Vercel dashboard, navigate to Settings → Environment Variables and add:

```env
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=https://api.coingecko.com/api/v3
```

⚠️ **Important**: Replace `your_api_key_here` with your actual CoinGecko API key.

### 4. Deploy

Click "Deploy" and Vercel will:

1. Install dependencies using pnpm
2. Run the build process
3. Deploy to production

## Environment Variables

| Variable                        | Description                      | Required |
| ------------------------------- | -------------------------------- | -------- |
| `NEXT_PUBLIC_COINGECKO_API_KEY` | CoinGecko API authentication key | Yes      |
| `NEXT_PUBLIC_API_BASE_URL`      | Base URL for CoinGecko API       | Yes      |

## Deployment Configuration

The `vercel.json` file includes:

- **Region**: `iad1` (US East) for optimal performance
- **Function Timeouts**: 10 seconds for API routes
- **Security Headers**: XSS protection, frame options, content type options
- **Service Worker**: Proper caching and scope configuration

## Build Output

Expected build metrics:

- **Home Page**: ~135 KB First Load JS
- **Coin Detail**: ~139 KB First Load JS
- **Static Pages**: Home and 404 pages
- **Dynamic Routes**: API endpoints and coin detail pages

## Performance Optimizations

The deployment is optimized for:

1. **Code Splitting**: Automatic chunk optimization
2. **Dynamic Imports**: Lazy loading for mobile components
3. **Service Worker**: Offline support and caching
4. **Image Optimization**: Next.js automatic image optimization
5. **Font Loading**: Optimized web font loading

## Monitoring

After deployment:

1. Check build logs in Vercel dashboard
2. Monitor real user metrics in Vercel Analytics
3. Review Lighthouse scores periodically
4. Set up error tracking (optional)

## Troubleshooting

### Build Failures

If the build fails:

1. Check build logs for specific errors
2. Ensure all environment variables are set
3. Verify `pnpm-lock.yaml` is committed
4. Run `pnpm build` locally to reproduce

### API Issues

If API calls fail in production:

1. Verify environment variables are set correctly
2. Check CoinGecko API key validity
3. Monitor API rate limits
4. Review CORS configuration

### Performance Issues

If performance is suboptimal:

1. Check bundle size in build output
2. Review dynamic import usage
3. Verify service worker is active
4. Analyze with Vercel Speed Insights

## Production URLs

Once deployed, your app will be available at:

- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`

## Rollback

To rollback to a previous deployment:

1. Go to Vercel dashboard → Deployments
2. Find the previous working deployment
3. Click "..." menu → "Promote to Production"

## CI/CD Pipeline

Every push to `main` branch triggers:

1. Automatic preview deployment
2. Build and test execution
3. Production deployment (if successful)

## Support

For issues or questions:

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Project Issues: [GitHub Issues](https://github.com/mario-digital/Saga_FE_Coin_Geko/issues)
