/**
 * General utility functions
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Formats currency with proper decimal places based on value
 * Handles both small values (crypto) and large values appropriately
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: value < 1 ? 6 : 2,
    maximumFractionDigits: value < 1 ? 8 : 2,
  }).format(value);
};

/**
 * Formats large numbers with abbreviations (K, M, B, T)
 * Can be used for market cap, volume, or any large number
 */
export const formatLargeNumber = (
  value: number,
  includePrefix = false
): string => {
  // For smaller values, use locale formatting
  if (value < 1000000) {
    const formatted = value.toLocaleString();
    return includePrefix ? `$${formatted}` : formatted;
  }

  const units = ['', 'K', 'M', 'B', 'T'];
  let unitIndex = 0;
  let scaledValue = value;

  while (scaledValue >= 1000 && unitIndex < units.length - 1) {
    unitIndex++;
    scaledValue /= 1000;
  }

  const formatted = `${scaledValue.toFixed(2)}${units[unitIndex]}`;
  return includePrefix ? `$${formatted}` : formatted;
};

/**
 * Formats market cap with dollar sign and abbreviations
 */
export const formatMarketCap = (marketCap: number): string => {
  return formatLargeNumber(marketCap, true);
};

/**
 * Formats percentage change with proper sign and color
 */
export const formatPercentage = (value: number): string => {
  const formatted = value.toFixed(2);
  return value >= 0 ? `+${formatted}%` : `${formatted}%`;
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
 * Safely formats a currency value that might be null or undefined
 */
export const safeFormatCurrency = (
  value: number | null | undefined,
  currency = 'USD'
): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return formatCurrency(value, currency);
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
export const safeFormatPercentage = (
  change: number | null | undefined
): string => {
  if (change == null || isNaN(change)) return '0.00%';
  return formatPercentage(change);
};

/**
 * Sanitizes HTML content by extracting text content
 * Note: For production use, consider using a library like DOMPurify
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: strip HTML tags
    return html.replace(/<[^>]*>/g, '');
  }

  try {
    // Client-side: use DOMParser for safe text extraction
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || html.replace(/<[^>]*>/g, '');
  } catch {
    // Fallback to regex stripping
    return html.replace(/<[^>]*>/g, '');
  }
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

// Legacy function aliases for backward compatibility
// These will be deprecated in future versions
export const formatPrice = formatCurrency;
export const formatPercentageChange = formatPercentage;
export const safeFormatPrice = safeFormatCurrency;
export const safeFormatPercentageChange = safeFormatPercentage;
