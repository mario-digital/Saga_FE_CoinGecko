# Cryptocurrency Dashboard UI Redesign Specification

## Current Issues

- Poor visual hierarchy and cramped text-only layout
- Missing coin logos/icons for visual identification
- No color indicators for price changes (gains/losses)
- Lack of interactive elements and hover states
- Basic typography with no visual interest

## Design Requirements

### Layout Structure

1. **Grid System**
   - Responsive card-based layout (grid on desktop, stack on mobile)
   - 16px padding within cards, 20px gap between cards
   - Maximum width container (1440px) with centered alignment

2. **Card Component Design**
   - White background with subtle shadow (0 2px 8px rgba(0,0,0,0.08))
   - 16px border radius for modern look
   - Hover state: slight elevation and border highlight
   - Click state: subtle scale animation (0.98)

### Visual Elements

1. **Coin Identity**
   - 48x48px coin logo/icon (left side)
   - Coin name (16px, font-weight: 600)
   - Symbol ticker (14px, muted gray #6B7280)
   - Rank badge (#1, #2, etc.) with subtle background

2. **Price Information**
   - Current price (24px, font-weight: 700)
   - Price change percentage with color coding:
     - Positive: #10B981 (green)
     - Negative: #EF4444 (red)
     - Neutral: #6B7280 (gray)
   - Arrow indicators (↑ ↓) for price direction

3. **Market Data**
   - Market cap (14px, with "Market Cap:" label)
   - 24h volume (14px, with "Volume:" label)
   - Formatted numbers with proper abbreviations (B, M, K)

### Typography

- Font family: Inter (primary), system fonts fallback
- Hierarchy:
  - Coin price: 24px bold
  - Coin name: 16px semibold
  - Labels: 12px regular (uppercase, letter-spacing: 0.05em)
  - Values: 14px regular

### Color Palette

```css
--primary: #3b82f6; /* Blue for CTAs */
--success: #10b981; /* Green for gains */
--danger: #ef4444; /* Red for losses */
--text-primary: #111827; /* Main text */
--text-secondary: #6b7280; /* Secondary text */
--bg-primary: #ffffff; /* Card background */
--bg-secondary: #f9fafb; /* Page background */
--border: #e5e7eb; /* Subtle borders */
```

### Interactive Features

1. **Search Integration**
   - Floating search button in header
   - Search results highlight matching coins
   - Smooth scroll to searched coin

2. **Sorting Options**
   - Sort by: Rank, Price, 24h Change, Market Cap
   - Visual sort indicators

3. **Loading States**
   - Skeleton screens for initial load
   - Subtle pulse animation

### Mobile Responsiveness

- Single column layout below 768px
- Horizontal scroll for market data if needed
- Touch-friendly tap targets (min 44px)
- Bottom sheet for search on mobile

## Implementation Priority

1. Card-based layout with proper spacing
2. Add coin logos/icons
3. Implement color-coded price changes
4. Add hover/interactive states
5. Enhance typography hierarchy
6. Add sorting functionality
