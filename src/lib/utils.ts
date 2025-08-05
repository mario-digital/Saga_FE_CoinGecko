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
  if (change == null || isNaN(change))
    return 'text-gray-600 dark:text-gray-400';
  if (change > 0) return 'text-success';
  if (change < 0) return 'text-danger';
  return 'text-gray-600 dark:text-gray-400';
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

/**
 * Formats currency with proper decimal places based on value
 */
export const formatCurrency = (value: number, currency = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: value < 1 ? 6 : 2,
    maximumFractionDigits: value < 1 ? 8 : 2,
  }).format(value);
};

/**
 * Formats percentage with proper sign
 */
export const formatPercentage = (value: number): string => {
  const formatted = value.toFixed(2);
  return value >= 0 ? `+${formatted}%` : `${formatted}%`;
};

/**
 * Formats large numbers with abbreviations
 */
export const formatLargeNumber = (value: number): string => {
  const units = ['', 'K', 'M', 'B', 'T'];
  let unitIndex = 0;
  let scaledValue = value;

  while (scaledValue >= 1000 && unitIndex < units.length - 1) {
    unitIndex++;
    scaledValue /= 1000;
  }

  return `${scaledValue.toFixed(2)}${units[unitIndex]}`;
};

/**
 * Sanitizes HTML content (basic implementation)
 */
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Formats date to readable string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
