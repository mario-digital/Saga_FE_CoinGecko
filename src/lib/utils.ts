/**
 * General utility functions
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const formatPrice = (
  price: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: price < 1 ? 6 : 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  }
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  }
  if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  return `$${marketCap.toLocaleString()}`;
};

export const formatPercentageChange = (change: number): string => {
  const formatted = Math.abs(change).toFixed(2);
  return change >= 0 ? `+${formatted}%` : `-${formatted}%`;
};

export const getPercentageChangeColor = (
  change: number | null | undefined
): string => {
  if (change == null || isNaN(change)) return 'text-gray-600';
  if (change > 0) return 'text-success-600';
  if (change < 0) return 'text-danger-600';
  return 'text-gray-600';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely formats a number that might be null or undefined
 */
export const safeFormatPrice = (
  price: number | null | undefined,
  currency: string = 'USD'
): string => {
  if (price == null || isNaN(price)) return 'N/A';
  return formatPrice(price, currency);
};

/**
 * Safely formats market cap that might be null or undefined
 */
export const safeFormatMarketCap = (
  marketCap: number | null | undefined
): string => {
  if (marketCap == null || isNaN(marketCap)) return 'N/A';
  return formatMarketCap(marketCap);
};

/**
 * Safely formats percentage change that might be null or undefined
 */
export const safeFormatPercentageChange = (
  change: number | null | undefined
): string => {
  if (change == null || isNaN(change)) return '0.00%';
  return formatPercentageChange(change);
};
