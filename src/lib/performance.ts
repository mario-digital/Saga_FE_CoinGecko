/**
 * Performance optimization utilities
 */

/**
 * Debounce function to limit execution frequency
 */
export function debounce<T extends (..._args: any[]) => any>(
  func: T,
  wait: number
): (..._args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(..._args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(..._args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 */
export function throttle<T extends (..._args: any[]) => any>(
  func: T,
  limit: number
): (..._args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(this: any, ..._args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, _args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(
  callback: () => void,
  options?: IdleRequestOptions
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(callback, 1) as unknown as number;
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Defer non-critical work to idle time
 */
export function deferToIdle(work: () => void): void {
  requestIdleCallback(
    () => {
      work();
    },
    { timeout: 2000 }
  );
}

/**
 * Split heavy computation into chunks
 */
export async function* chunkedProcessor<T>(
  items: T[],
  chunkSize: number = 10
): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < items.length; i += chunkSize) {
    yield items.slice(i, i + chunkSize);

    // Allow browser to handle other tasks
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
