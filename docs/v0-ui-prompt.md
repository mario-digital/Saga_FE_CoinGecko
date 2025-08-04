# v0 UI Generation Prompt

## Prompt for v0.dev

Create a modern cryptocurrency dashboard with the following specifications:

**Layout:**

- Responsive grid layout with cards for each cryptocurrency
- Cards should have white backgrounds with subtle shadows and rounded corners (16px radius)
- 20px gap between cards, max container width 1440px

**Each Cryptocurrency Card Must Include:**

1. Left section:
   - 48x48px coin logo/icon
   - Coin name (bold, 16px)
   - Symbol ticker in gray (14px)
   - Rank badge (e.g., #1, #2)

2. Right section:
   - Current price (24px, bold)
   - Price change percentage with color coding:
     - Green (#10B981) with ↑ for positive
     - Red (#EF4444) with ↓ for negative
   - Market cap and 24h volume (14px, gray labels)

**Styling:**

- Use Inter font family
- Hover effects: slight elevation and border highlight
- Mobile responsive: single column below 768px
- Color scheme:
  - Background: #F9FAFB
  - Cards: #FFFFFF
  - Text: #111827 (primary), #6B7280 (secondary)
  - Success: #10B981, Danger: #EF4444

**Interactive Elements:**

- Hover states on cards
- Sort dropdown (by rank, price, 24h change)
- Search functionality integration ready

Use React with Tailwind CSS. Include sample data for Bitcoin, Ethereum, and 3 other major cryptocurrencies.

## Alternative Prompt for Lovable.app

Build a cryptocurrency price tracker dashboard that displays:

**Requirements:**

- Grid of cryptocurrency cards showing real-time price data
- Each card displays: coin logo, name, symbol, current price, 24h price change (with green/red colors), market cap, and volume
- Modern, clean design with proper spacing and typography hierarchy
- Responsive design that works on mobile and desktop
- Interactive hover effects on cards
- Sort functionality by different metrics
- Use shadcn/ui components where applicable
- Integrate with CoinGecko API for real data

**Design specs:**

- White cards on light gray background
- Rounded corners and subtle shadows
- Green for price increases, red for decreases
- Inter font family
- 48px coin logos with proper aspect ratio
- Clear visual hierarchy with varied font sizes

Make it look professional like modern crypto exchanges (Coinbase, Binance) but cleaner and more minimalist.
