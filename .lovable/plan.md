
# AI Supply Chain Dashboard — Modern Startup Aesthetic

A B2B command center for hardware/electronics teams to monitor components, supplier stock, and shortage risks — powered by Lovable AI. Visual feel: Linear / Vercel dashboard, not legacy enterprise.

## Visual direction (refined)
- **Palette:** navy `#0f1b3d` reserved for headings/primary accents; bright steel `#3b6fa0` for interactive accents; near-white canvas `#f8fafc` with `#ffffff` cards; soft `#e8edf3` borders. Status: emerald (healthy), amber (watch), rose (critical) — used sparingly as dots/badges, not heavy fills.
- **Typography:** Inter, tight tracking, tabular numerics. Large but light headings (semibold, not bold). Plenty of whitespace.
- **Surfaces:** white cards with hairline 1px borders + very subtle shadow (`shadow-sm`), 12–14px radius. No gradients, no heavy fills, no skeuomorphism.
- **Density:** generous padding (24–32px), 14px body text, ample row height in tables (Linear-like).
- **Motion:** subtle — 150ms ease transitions on hover, no bouncy animations.

## App structure (collapsible sidebar + top bar)
1. **Overview** — KPIs, risk summary, top critical items
2. **Components** — searchable inventory
3. **Suppliers** — supplier directory
4. **Risk Alerts** — ranked shortage feed
5. **AI Copilot** — streaming chat

## Key features

### Overview
- 4 KPI tiles (Total SKUs, At-Risk, Avg Lead Time, Open Alerts) — minimalist, big number + tiny label + sparkline
- AI Risk Summary card — natural-language briefing with refresh button
- Inventory value 30-day trend (line chart)
- Top 5 critical components compact table

### Components
- Searchable, filterable table: MPN, manufacturer, category, on-hand, weeks-of-supply, lead time, risk dot
- Row click → side drawer with stock sparkline, supplier list, AI risk explanation
- Filters: category, risk level, manufacturer

### Suppliers
- Clean supplier cards: name, region, reliability score, on-time %, component count
- Click → detail view with their components and simulated live stock

### Risk Alerts
- Ranked feed: component, reason (lead time spike, low stock, single-source, geo), severity, suggested action
- "Ask AI" on each → opens copilot pre-filled

### AI Copilot
- Streaming chat grounded in seeded data
- Suggested prompt chips
- Token-by-token streaming via edge function

## Data
- ~40 seeded components (MCUs, passives, connectors, memory, power) across ~12 suppliers (US/EU/Asia)
- Risk scores computed client-side from stock + lead time + sourcing concentration

## Tech
- Lovable Cloud + Lovable AI (`google/gemini-2.5-flash`) streaming edge function for summaries and copilot
- shadcn sidebar (icon-collapsible), drawer, tables
- recharts for sparklines and trend lines
