/**
 * Global type declarations
 */

import { ApiCache } from '@/lib/cache';

declare global {
  // eslint-disable-next-line no-var
  var _apiCache: ApiCache | undefined;
  // eslint-disable-next-line no-var
  var _cacheStartTime: number | undefined;
}

export {};
