# Stake Mines demo

Responsive Next.js App Router and TypeScript casino demo inspired by Stake. The lobby includes six locally hosted game covers; only Mines is playable. No real payments or accounts.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Mines is at `/casino/games/mines`.

## Features

- 3×3 through 6×6 grids, adjustable mine count, random tile selection.
- Single Bet button with click/tap position detection: left presets a loss on pick 3–5 (or the final available gem on high-mine boards); right guarantees safe picks through automatic cash-out. Early cash-out works in both modes. Keyboard activation defaults to the right-half behavior.
- USD, INR, EUR, and GBP virtual wallets, each starting at 1,000 currency units with independent balances and history. Currency selection persists; switching is disabled during active bets. No FX conversions or live rates.
- Stake-style result popup showing net profit, multiplier, and total payout after cash-out or an automatic win. Dismiss with the close button or Escape.
- Integer-cent balances, adaptive mine placement for preset outcomes described in Game rules, probability-based multipliers with a 1% house edge.
- Cash out before any pick to refund the bet; revealing every safe tile automatically pays out.
- Balance, current round, and last 50 results persist locally in the browser.
- Mobile navigation, touch controls, keyboard access, optional sound, and reduced-motion support.

## Validation

```sh
npm run build
npm run typecheck
npx playwright install chromium
npm test
```

Playwright covers desktop and mobile search, layout overflow, non-clickable sample games, validation, payouts, losses, persistence, immediate refunds, and automatic cash-out. Tests stub randomness; normal gameplay uses the browser Web Crypto API.

This is a client-side, virtual-credit demo. Local state is user-editable; there is no server-authoritative ledger, authentication, deposit flow, or real-money security. Branding and sample covers reference Stake.com. This project is not affiliated with Stake.
