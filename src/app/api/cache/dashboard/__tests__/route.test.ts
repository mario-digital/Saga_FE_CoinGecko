/**
 * @jest-environment node
 */

// Mock next/server before importing anything else
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(url => ({
    url,
  })),
  NextResponse: jest.fn().mockImplementation((body, init) => ({
    headers: new Map(Object.entries(init?.headers || {})),
    status: init?.status || 200,
    text: async () => body,
  })),
}));

import { GET } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { apiCache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';

describe('GET /api/cache/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiCache.clear();
  });

  it('should return HTML dashboard with correct content type', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(response.headers.get('Cache-Control')).toBe(
      'no-cache, no-store, must-revalidate'
    );
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Cache Dashboard');
  });

  it('should include cache statistics in the HTML', async () => {
    // Set up some cache data
    apiCache.set('test-key', 'test-value');
    apiCache.get('test-key'); // Create a hit
    apiCache.get('missing-key'); // Create a miss

    const stats = apiCache.getStats();

    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    // Check that stats are included in the HTML
    expect(html).toContain(stats.hitRatePercentage);
    expect(html).toContain(`${stats.hits}`);
    expect(html).toContain(`${stats.misses}`);
    expect(html).toContain(`${stats.itemCount}`);
  });

  it('should include rate limiter statistics in the HTML', async () => {
    const rlStats = rateLimiter.getStats();

    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    // Check that rate limiter stats are included
    expect(html).toContain(`${rlStats.activeRequests} / 10`);
    expect(html).toContain(`${rlStats.queueSize}`);
    expect(html).toContain(`${rlStats.requestsInWindow}`);
    expect(html).toContain(rlStats.isBusy ? 'BUSY' : 'READY');
  });

  it('should include CSS styles for dashboard', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    expect(html).toContain('<style>');
    expect(html).toContain('background: linear-gradient');
    expect(html).toContain('.container');
    expect(html).toContain('.stat-card');
    expect(html).toContain('.hit-rate-circle');
  });

  it('should include JavaScript for auto-refresh', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    expect(html).toContain('<script>');
    expect(html).toContain('setInterval');
    expect(html).toContain('loadCacheItems');
    expect(html).toContain('loadCacheStats');
  });

  it('should include cache configuration details', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    expect(html).toContain('2 minutes'); // Coins List TTL
    expect(html).toContain('5 minutes'); // Coin Detail TTL
    expect(html).toContain('15 minutes'); // Price History TTL
    expect(html).toContain('100 MB'); // Max Cache Size
  });

  it('should display cache size in KB', async () => {
    // Add some data to cache
    apiCache.set('large-data', { data: new Array(1000).fill('x').join('') });

    const stats = apiCache.getStats();
    const sizeInKB = (stats.size / 1024).toFixed(2);

    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    expect(html).toContain(`${sizeInKB} KB`);
  });

  it('should include refresh button', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    expect(html).toContain('btn-primary');
    expect(html).toContain('onclick="location.reload()"');
    expect(html).toContain('🔄 Refresh Dashboard');
  });

  it('should include cache items section', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    expect(html).toContain('cache-section');
    expect(html).toContain('📦 In-Memory Cache (LRU)');
    expect(html).toContain('🗄️ Vercel KV Storage');
    expect(html).toContain('/api/cache/items');
  });

  it('should have proper HTML structure', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    // Check for proper HTML structure
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<head>');
    expect(html).toContain('<meta charset="UTF-8">');
    expect(html).toContain('<meta name="viewport"');
    expect(html).toContain(
      '<title>Cache Dashboard - Real-time Monitoring</title>'
    );
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
    expect(html).toContain('</html>');
  });

  it('should use correct status badge classes', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/dashboard'
    );
    const response = await GET(request);
    const html = await response.text();

    const rlStats = rateLimiter.getStats();

    if (rlStats.isBusy) {
      expect(html).toContain('status-busy');
    } else {
      expect(html).toContain('status-ready');
    }
  });
});
