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
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add API key if available
  const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
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