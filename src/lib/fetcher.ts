/**
 * SWR fetcher function for API requests
 */

import { API_BASE_URL } from './constants';

export class ApiError extends Error {
  status: number;
  info: any;

  constructor(message: string, status: number, info?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.info = info;
  }
}

export const fetcher = async (url: string): Promise<any> => {
  // If the URL starts with /api, use it as is (for our Next.js API routes)
  // Otherwise, prepend the API base URL for external APIs
  const fullUrl = url.startsWith('/api')
    ? url
    : url.startsWith('http')
      ? url
      : `${API_BASE_URL}${url}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Only add API key for direct CoinGecko calls (not our proxy routes)
  if (!url.startsWith('/api')) {
    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }
  }

  const response = await fetch(fullUrl, {
    headers,
  });

  if (!response.ok) {
    let errorInfo;
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: response.statusText };
    }

    throw new ApiError(
      errorInfo.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorInfo
    );
  }

  return response.json();
};
