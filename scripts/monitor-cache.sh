#!/bin/bash

# Monitor cache in real-time
echo "🔍 Cache Monitor - Press Ctrl+C to exit"
echo "========================================="

while true; do
    clear
    echo "📊 CACHE STATISTICS $(date '+%H:%M:%S')"
    echo "========================================="
    
    # Get cache stats
    stats=$(curl -s "http://localhost:3000/api/cache/stats")
    
    # Parse and display
    echo "$stats" | python3 -c "
import json, sys
data = json.load(sys.stdin)
cache = data['cache']
rl = data['rateLimiter']

print(f'''
📦 CACHE STATUS:
  • Items Cached: {cache['itemCount']}
  • Cache Size: {cache['size'] / 1024:.2f} KB
  • Hit Rate: {cache['hitRatePercentage']}
  • Hits: {cache['hits']} | Misses: {cache['misses']}

⚡ RATE LIMITER:
  • Active Requests: {rl['activeRequests']}/10
  • Queue Size: {rl['queueSize']}
  • Requests/min: {rl['requestsInWindow']}
  • Busy: {'🔴 YES' if rl['isBusy'] else '🟢 NO'}
''')
"
    
    sleep 2
done