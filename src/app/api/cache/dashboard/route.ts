/**
 * Cache Dashboard HTML endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiCache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';

export async function GET(_request: NextRequest) {
  const stats = apiCache.getStats();
  const rateLimitStats = rateLimiter.getStats();
  const hitRatePercentage = stats.hitRatePercentage || '0.00%';
  const hitRateValue = stats.hitRate || 0;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cache Dashboard - Real-time Monitoring</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --dark: #1e293b;
            --gray: #64748b;
            --light: #f1f5f9;
            --white: #ffffff;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            color: var(--dark);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        /* Header Section */
        .header {
            text-align: center;
            margin-bottom: 3rem;
            animation: fadeInDown 0.8s ease;
        }
        
        .header h1 {
            color: var(--white);
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header p {
            color: var(--gray);
            font-size: 1.1rem;
        }
        
        .live-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(16, 185, 129, 0.1);
            padding: 0.25rem 1rem;
            border-radius: 100px;
            margin-top: 1rem;
        }
        
        .live-dot {
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        .live-text {
            color: var(--success);
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
            animation: fadeIn 1s ease;
        }
        
        .stat-card {
            background: var(--white);
            border-radius: 16px;
            padding: 1.75rem;
            box-shadow: var(--shadow);
            border: 1px solid rgba(148, 163, 184, 0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--primary-dark));
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }
        
        .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }
        
        .stat-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--dark);
        }
        
        .stat-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            font-size: 1.25rem;
        }
        
        .icon-primary {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
        }
        
        .icon-warning {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }
        
        .icon-success {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }
        
        /* Hit Rate Display */
        .hit-rate-display {
            text-align: center;
            padding: 2rem 0;
        }
        
        .hit-rate-circle {
            width: 140px;
            height: 140px;
            margin: 0 auto 1rem;
            position: relative;
        }
        
        .hit-rate-svg {
            transform: rotate(-90deg);
        }
        
        .hit-rate-bg {
            fill: none;
            stroke: #e2e8f0;
            stroke-width: 8;
        }
        
        .hit-rate-progress {
            fill: none;
            stroke: url(#gradient);
            stroke-width: 8;
            stroke-linecap: round;
            stroke-dasharray: 408;
            stroke-dashoffset: ${408 - 408 * hitRateValue};
            transition: stroke-dashoffset 1s ease;
            animation: drawCircle 1.5s ease;
        }
        
        .hit-rate-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .hit-rate-label {
            color: var(--gray);
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        /* Stats Items */
        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--light);
        }
        
        .stat-item:last-child {
            border-bottom: none;
        }
        
        .stat-label {
            color: var(--gray);
            font-size: 0.95rem;
        }
        
        .stat-value {
            font-weight: 600;
            color: var(--dark);
            font-size: 1rem;
        }
        
        .stat-value.highlight {
            color: var(--primary);
            font-size: 1.1rem;
        }
        
        /* Status Badge */
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.375rem 0.875rem;
            border-radius: 100px;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .status-ready {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }
        
        .status-busy {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
        }
        
        .status-icon {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            animation: pulse 2s infinite;
        }
        
        /* Progress Bar */
        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--light);
            border-radius: 100px;
            overflow: hidden;
            margin-top: 0.5rem;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--primary-dark));
            border-radius: 100px;
            transition: width 0.5s ease;
        }
        
        /* Cache Items Section */
        .cache-section {
            background: var(--white);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow);
            border: 1px solid rgba(148, 163, 184, 0.1);
            margin-bottom: 2rem;
            animation: fadeInUp 1s ease;
        }
        
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }
        
        .section-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
        }
        
        .item-count {
            background: var(--light);
            color: var(--gray);
            padding: 0.25rem 0.75rem;
            border-radius: 100px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .cache-items-list {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 0.5rem;
        }
        
        .cache-items-list::-webkit-scrollbar {
            width: 6px;
        }
        
        .cache-items-list::-webkit-scrollbar-track {
            background: var(--light);
            border-radius: 100px;
        }
        
        .cache-items-list::-webkit-scrollbar-thumb {
            background: var(--gray);
            border-radius: 100px;
        }
        
        .cache-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            margin-bottom: 0.75rem;
            background: var(--light);
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .cache-item:hover {
            background: #e2e8f0;
            transform: translateX(4px);
        }
        
        .cache-key {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
            color: var(--primary);
            word-break: break-all;
            flex: 1;
            margin-right: 1rem;
        }
        
        .cache-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .cache-size {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .cache-ttl {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            white-space: nowrap;
        }
        
        .cache-ttl.expired {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--gray);
        }
        
        .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        .empty-text {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }
        
        .empty-subtext {
            font-size: 0.9rem;
            color: #94a3b8;
        }
        
        /* Action Buttons */
        .actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 3rem;
            animation: fadeInUp 1.2s ease;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: var(--white);
            box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.25);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(99, 102, 241, 0.35);
        }
        
        .btn-secondary {
            background: var(--white);
            color: var(--primary);
            border: 2px solid var(--primary);
        }
        
        .btn-secondary:hover {
            background: var(--primary);
            color: var(--white);
            transform: translateY(-2px);
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @keyframes drawCircle {
            from { stroke-dashoffset: 408; }
            to { stroke-dashoffset: ${408 - 408 * hitRateValue}; }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>⚡ Cache Dashboard</h1>
            <p>Real-time monitoring of your API cache performance</p>
            <div class="live-indicator">
                <span class="live-dot"></span>
                <span class="live-text">Live Updates</span>
            </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid">
            <!-- Cache Performance Card -->
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-title">
                        <div class="stat-icon icon-primary">📊</div>
                        Cache Performance
                    </div>
                </div>
                <div class="hit-rate-display">
                    <div class="hit-rate-circle">
                        <svg class="hit-rate-svg" width="140" height="140">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle class="hit-rate-bg" cx="70" cy="70" r="65"/>
                            <circle class="hit-rate-progress" cx="70" cy="70" r="65"/>
                        </svg>
                        <div class="hit-rate-text">${hitRatePercentage}</div>
                    </div>
                    <div class="hit-rate-label">Hit Rate</div>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Hits</span>
                    <span class="stat-value highlight">${stats.hits}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Misses</span>
                    <span class="stat-value">${stats.misses}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Items Cached</span>
                    <span class="stat-value">${stats.itemCount}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Cache Size</span>
                    <span class="stat-value">${(stats.size / 1024).toFixed(2)} KB</span>
                </div>
            </div>
            
            <!-- Rate Limiter Card -->
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-title">
                        <div class="stat-icon icon-warning">⚡</div>
                        Rate Limiter
                    </div>
                    <span class="status-badge ${rateLimitStats.isBusy ? 'status-busy' : 'status-ready'}">
                        <span class="status-icon"></span>
                        ${rateLimitStats.isBusy ? 'BUSY' : 'READY'}
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Active Requests</span>
                    <span class="stat-value">${rateLimitStats.activeRequests} / 10</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(rateLimitStats.activeRequests / 10) * 100}%"></div>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Queue Size</span>
                    <span class="stat-value">${rateLimitStats.queueSize}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Requests (last min)</span>
                    <span class="stat-value">${rateLimitStats.requestsInWindow}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Window Start</span>
                    <span class="stat-value">${new Date(rateLimitStats.windowStart).toLocaleTimeString()}</span>
                </div>
            </div>
            
            <!-- Cache Configuration Card -->
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-title">
                        <div class="stat-icon icon-success">⚙️</div>
                        Cache Configuration
                    </div>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Coins List TTL</span>
                    <span class="stat-value">2 minutes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Coin Detail TTL</span>
                    <span class="stat-value">5 minutes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Price History TTL</span>
                    <span class="stat-value">15 minutes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Max Cache Size</span>
                    <span class="stat-value">100 MB</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Max Items</span>
                    <span class="stat-value">500</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Eviction Policy</span>
                    <span class="stat-value">LRU</span>
                </div>
            </div>
        </div>
        
        <!-- Cached Items Section -->
        <div class="cache-section">
            <div class="section-header">
                <div class="section-title">
                    📦 Cached Items
                    <span class="item-count" id="itemCount">0 items</span>
                </div>
            </div>
            <div class="cache-items-list" id="itemsList">
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-text">No items currently cached</div>
                    <div class="empty-subtext">Items will appear here as they are cached</div>
                </div>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="actions">
            <button class="btn btn-primary" onclick="location.reload()">
                🔄 Refresh Dashboard
            </button>
            <button class="btn btn-secondary" onclick="clearCache()">
                🗑️ Clear Cache
            </button>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 5 seconds
        setInterval(() => {
            loadCacheItems();
            loadCacheStats();
            updateLiveIndicator();
        }, 5000);
        
        // Update live indicator
        function updateLiveIndicator() {
            const dot = document.querySelector('.live-dot');
            dot.style.animation = 'none';
            setTimeout(() => {
                dot.style.animation = 'pulse 2s infinite';
            }, 100);
        }
        
        // Fetch and update cache statistics
        async function loadCacheStats() {
            try {
                const baseUrl = window.location.origin;
                const response = await fetch(baseUrl + '/api/cache/stats');
                if (!response.ok) {
                    console.warn('Failed to fetch cache stats:', response.status);
                    return;
                }
                const data = await response.json();
                const stats = data.cache; // Extract cache stats from nested structure
                
                // Update hit rate percentage
                document.querySelector('.hit-rate-text').textContent = stats.hitRatePercentage || '0.00%';
                
                // Update hit rate circle animation
                const hitRateValue = stats.hitRate || 0;
                const circle = document.querySelector('.hit-rate-progress');
                if (circle) {
                    const dashOffset = 408 - (408 * hitRateValue);
                    circle.style.strokeDashoffset = dashOffset;
                }
                
                // Update stats values
                document.querySelectorAll('.stat-item').forEach(item => {
                    const label = item.querySelector('.stat-label')?.textContent;
                    const valueElement = item.querySelector('.stat-value');
                    if (label && valueElement) {
                        switch(label) {
                            case 'Total Hits':
                                valueElement.textContent = stats.hits || 0;
                                break;
                            case 'Total Misses':
                                valueElement.textContent = stats.misses || 0;
                                break;
                            case 'Items Cached':
                                valueElement.textContent = stats.itemCount || 0;
                                break;
                            case 'Cache Size':
                                valueElement.textContent = ((stats.size || 0) / 1024).toFixed(2) + ' KB';
                                break;
                        }
                    }
                });
            } catch (error) {
                console.error('Failed to load cache stats:', error);
            }
        }
        
        // Fetch and display cache items
        async function loadCacheItems() {
            try {
                const baseUrl = window.location.origin;
                const response = await fetch(baseUrl + '/api/cache/items');
                if (!response.ok) {
                    console.warn('Failed to fetch cache items:', response.status);
                    return;
                }
                const items = await response.json();
                
                const itemsList = document.getElementById('itemsList');
                const itemCount = document.getElementById('itemCount');
                
                itemCount.textContent = items.length + ' items';
                
                if (items.length === 0) {
                    itemsList.innerHTML = \`
                        <div class="empty-state">
                            <div class="empty-icon">📭</div>
                            <div class="empty-text">No items currently cached</div>
                            <div class="empty-subtext">Items will appear here as they are cached</div>
                        </div>
                    \`;
                } else {
                    itemsList.innerHTML = items.map(item => {
                        const isExpired = item.remainingTTL === 'Expired';
                        const sizeInKB = (item.size / 1024).toFixed(2);
                        return \`
                            <div class="cache-item">
                                <span class="cache-key">\${item.key}</span>
                                <div class="cache-meta">
                                    <span class="cache-size">\${sizeInKB} KB</span>
                                    <span class="cache-ttl \${isExpired ? 'expired' : ''}">\${item.remainingTTL}</span>
                                </div>
                            </div>
                        \`;
                    }).join('');
                }
            } catch (error) {
                console.error('Failed to load cache items:', error);
            }
        }
        
        // Clear cache function
        async function clearCache() {
            if (confirm('Are you sure you want to clear all cached items?')) {
                // TODO: Implement cache clear endpoint
                alert('Cache clearing functionality would be implemented here');
                location.reload();
            }
        }
        
        // Load items and stats on page load
        loadCacheItems();
        loadCacheStats();
        
        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
    
    ${
      process.env.NODE_ENV === 'production'
        ? `
    <div style="text-align: center; padding: 2rem 1rem 3rem; color: #94a3b8; font-size: 0.9rem;">
        <p style="margin-bottom: 0.5rem;">
            <strong>Note:</strong> This dashboard is designed for development environment monitoring.
        </p>
        <p>
            In production, API endpoints run in separate Lambda instances. Cache is working but stats are isolated per instance.
        </p>
    </div>
    `
        : ''
    }
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
