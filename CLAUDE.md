# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the `client/` directory:

```bash
npm run dev       # Start Vite dev server on localhost:3000
npm run build     # Build frontend (Vite) + backend server (esbuild) into dist/
npm run start     # Run production build (NODE_ENV=production)
npm run check     # TypeScript type check (no emit)
npm run format    # Format with Prettier
```

There is no test runner configured despite Vitest being installed.

## Architecture

**FinanceFlow** is a mobile-first PWA personal finance dashboard. It is entirely client-side — there is no backend API. All data persists to `localStorage`.

### State Layer

State flows through two stores in [client/src/lib/](client/src/lib/):

- **[finance-store.ts](client/src/lib/finance-store.ts)** — Core business logic: transactions, budget categories, recurring payments, and 12-month forecast. Data key: `financeflow_data_v2`.
- **[history-store.ts](client/src/lib/history-store.ts)** — Monthly snapshots for trend analysis and year-over-year comparisons. Data key: `financeflow_history_v1`.

These stores are wrapped by custom hooks ([useFinance.ts](client/src/hooks/useFinance.ts), [useHistory.ts](client/src/hooks/useHistory.ts)) and exposed globally via [FinanceContext.tsx](client/src/contexts/FinanceContext.tsx). Components access state only through `useFinanceContext()`.

### Routing & Layout

Uses **Wouter** (not React Router). Routes are defined in [App.tsx](client/src/App.tsx). The app is constrained to `max-w-lg mx-auto` for mobile-first layout. Navigation is via a fixed `BottomNav` on mobile; there is no top nav.

The onboarding carousel renders in place of the main app on first launch (controlled by an `isInitialized` flag in the finance store).

### Key Data Models

- **Transaction**: `{ id, date, description, amount, category, type: 'income'|'expense', isRecurring?, recurringId? }`
- **RecurringTransaction**: includes `frequency` (`weekly|biweekly|monthly|quarterly|yearly`), `nextDueDate` (auto-calculated), and `lastGenerated`
- **BudgetCategory**: `{ allocated, spent, color, icon }` — `spent` is derived from current-month transactions
- **MonthlySnapshot**: keyed as `"YYYY-M"`, stores income/expenses/balance/savingsRate/categoryBreakdowns for history

### Forecast Engine

The 12-month forecast in the finance store calculates future cash flows from active recurring transactions by projecting occurrences per month. This runs as a derived calculation whenever recurring transactions change.

## Path Aliases

`@/*` resolves to `client/src/*`. Use `@/components`, `@/pages`, `@/lib`, `@/hooks`, etc.

## Design System

- **Fonts**: DM Serif Display (headings), DM Sans (body), JetBrains Mono (numbers/currency) — loaded from Google Fonts
- **Accent color**: Gold `#B5A167`
- **Default theme**: Dark (navy background)
- **Component library**: shadcn/ui built on Radix UI primitives
- **Animations**: Framer Motion + Tailwind CSS 4 utilities
- Design tokens are defined as CSS custom properties in [client/src/index.css](client/src/index.css) using `oklch` color space
