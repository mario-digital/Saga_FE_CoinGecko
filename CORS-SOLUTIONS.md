# CORS Error Solutions

## Current Implementation

The app now includes automatic CORS error detection and handling:

1. **Automatic Retry**: When a CORS error is detected in the fetch layer, the app will automatically retry the request once after a 1-second delay
2. **User-Friendly Error Messages**: CORS errors show as "Connection Issue" with helpful guidance
3. **Auto-Retry with Countdown**: The error page shows a **45-second countdown** and automatically retries

## Why CORS Errors Occur

CORS errors happen when calling the CoinGecko API directly from the browser because:

- The app is deployed as a static site (`output: 'export'` in next.config.js)
- CoinGecko's free API has inconsistent CORS headers across their CDN/servers
- Browser security policies block requests when CORS headers are missing

## Solutions

### Option 1: Use CoinGecko Demo API Key (Recommended)

1. Sign up for a free CoinGecko account at https://www.coingecko.com/api/pricing
2. Get your Demo API key
3. Add it to your `.env.local`:
   ```
   NEXT_PUBLIC_COINGECKO_API_KEY=your-demo-api-key-here
   ```
4. The app will automatically use the API key in requests

### Option 2: Deploy with Server-Side Rendering

1. Remove `output: 'export'` from `next.config.js`
2. Create API routes in `app/api/` to proxy requests
3. Deploy to Vercel or another platform that supports Next.js SSR

### Option 3: Use a CORS Proxy (Development Only)

For development, you can use a CORS proxy service:

1. Update `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://cors-anywhere.herokuapp.com/https://api.coingecko.com/api/v3
   ```
2. Note: This is NOT recommended for production

### Option 4: Use CoinGecko Pro API

The Pro API endpoints have better CORS support:

1. Subscribe to CoinGecko Pro
2. Update the API base URL to use pro-api.coingecko.com

## Browser Extensions

If you're experiencing persistent CORS errors:

1. Check if you have ad blockers or privacy extensions that might block API requests
2. Try disabling extensions temporarily
3. Try in an incognito/private window

## Current Mitigations

The app includes several mitigations:

- **Fetch Layer**: Automatic retry once with 1-second delay when CORS error detected
- **UI Layer**: 45-second countdown timer before auto-retry
- **Error Messages**: Clear "Connection Issue" message with guidance
- **Browser Extension Check**: Suggests checking ad blockers/privacy extensions
- **Fallback Options**: Manual retry button and "Go Back" navigation

## Testing CORS Handling

To test the CORS error handling:

1. Block api.coingecko.com in your browser's developer tools (Network tab)
2. Or use a browser extension to block the domain
3. You should see the "Connection Issue" error with 45-second auto-retry countdown
4. The fetch layer will have already attempted one retry before showing the error

## Technical Details

### Error Detection

The app detects CORS errors by checking for:

- `TypeError: Failed to fetch`
- `TypeError: Load failed`
- `Network request failed`
- Any network error with no HTTP status code

### Retry Strategy

1. **Fetch Layer**: 1 retry after 1 second delay (automatic, invisible to user)
2. **UI Layer**: If still failing, shows error with 45-second countdown before retry
3. **Manual Option**: User can click "Retry" button at any time
