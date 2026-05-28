/**
 * History Store - Monthly snapshot tracking for trend analysis
 * 
 * Stores monthly snapshots of financial data to enable:
 * - Real "vs last month" trend comparisons on the Dashboard
 * - Historical budget performance tracking
 * - More accurate forecasting based on actual spending patterns
 * 
 * Schema designed for easy migration to MongoDB backend later:
 * - Each snapshot is a self-contained document
 * - The history array maps directly to a MongoDB collection
 * - getSnapshot/saveSnapshot map to findOne/insertOne operations
 */

export interface CategorySnapshot {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

export interface MonthlySnapshot {
  /** Unique key: `${year}-${month}` e.g. "2026-4" for May 2026 (0-indexed month) */
  key: string;
  month: number;  // 0-indexed (0 = January)
  year: number;
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  categoryBreakdowns: CategorySnapshot[];
  transactionCount: number;
  /** ISO date when this snapshot was created */
  createdAt: string;
}

export interface HistoryState {
  snapshots: MonthlySnapshot[];
  lastSnapshotCheck: string; // ISO date of last auto-snapshot check
}

const HISTORY_STORAGE_KEY = 'financeflow_history_v1';

/**
 * Get the history state from localStorage
 */
export function getHistoryState(): HistoryState {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Fall through to defaults
  }

  // Start with empty history — data accumulates as user uses the app
  const state: HistoryState = {
    snapshots: [],
    lastSnapshotCheck: new Date().toISOString(),
  };

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state));
  return state;
}

/**
 * Save history state to localStorage
 */
export function saveHistoryState(state: HistoryState): void {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state));
}

/**
 * Get a specific month's snapshot
 */
export function getSnapshot(year: number, month: number): MonthlySnapshot | null {
  const state = getHistoryState();
  return state.snapshots.find(s => s.year === year && s.month === month) || null;
}

/**
 * Get the previous month's snapshot relative to a given date
 */
export function getPreviousMonthSnapshot(year: number, month: number): MonthlySnapshot | null {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  return getSnapshot(prevYear, prevMonth);
}

/**
 * Save a snapshot for a specific month (upserts - replaces if exists)
 */
export function saveSnapshot(snapshot: MonthlySnapshot): HistoryState {
  const state = getHistoryState();
  
  // Remove existing snapshot for this month if it exists
  state.snapshots = state.snapshots.filter(
    s => !(s.year === snapshot.year && s.month === snapshot.month)
  );
  
  // Add the new snapshot
  state.snapshots.push(snapshot);
  
  // Sort by date (newest first)
  state.snapshots.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  saveHistoryState(state);
  return state;
}

/**
 * Create a snapshot from current finance state data
 */
export function createSnapshotFromState(
  year: number,
  month: number,
  income: number,
  expenses: number,
  balance: number,
  savingsRate: number,
  categoryBreakdowns: CategorySnapshot[],
  transactionCount: number
): MonthlySnapshot {
  return {
    key: `${year}-${month}`,
    month,
    year,
    income,
    expenses,
    balance,
    savingsRate,
    categoryBreakdowns,
    transactionCount,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Check if we need to auto-snapshot the previous month
 * Called on app load — if the current month is different from the last check,
 * it means we've crossed a month boundary and should freeze the prior month.
 * 
 * Returns the month/year that needs snapshotting, or null if not needed.
 */
export function checkAutoSnapshot(): { year: number; month: number } | null {
  const state = getHistoryState();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Determine the last month we checked
  const lastCheck = new Date(state.lastSnapshotCheck);
  const lastCheckMonth = lastCheck.getMonth();
  const lastCheckYear = lastCheck.getFullYear();

  // If we're in the same month as last check, no snapshot needed
  if (currentMonth === lastCheckMonth && currentYear === lastCheckYear) {
    return null;
  }

  // We've crossed a month boundary — the previous month needs snapshotting
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Check if we already have a snapshot for that month
  const existing = getSnapshot(prevYear, prevMonth);
  
  // Update the last check timestamp
  state.lastSnapshotCheck = now.toISOString();
  saveHistoryState(state);

  if (existing) {
    return null; // Already snapshotted
  }

  return { year: prevYear, month: prevMonth };
}

/**
 * Calculate trend percentage between current and previous values
 * Returns { direction, value, label } for use in MetricCard
 */
export function calculateTrend(
  currentValue: number,
  previousValue: number | null
): { direction: 'up' | 'down' | 'neutral'; value: string; available: boolean } {
  if (previousValue === null || previousValue === 0) {
    return { direction: 'neutral', value: '—', available: false };
  }

  const change = ((currentValue - previousValue) / previousValue) * 100;
  const absChange = Math.abs(change);

  if (absChange < 0.5) {
    return { direction: 'neutral', value: '0%', available: true };
  }

  return {
    direction: change > 0 ? 'up' : 'down',
    value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
    available: true,
  };
}

/**
 * Get all snapshots for a date range (useful for charts)
 */
export function getSnapshotRange(startYear: number, startMonth: number, count: number): MonthlySnapshot[] {
  const state = getHistoryState();
  const results: MonthlySnapshot[] = [];

  for (let i = 0; i < count; i++) {
    const month = (startMonth + i) % 12;
    const year = startYear + Math.floor((startMonth + i) / 12);
    const snapshot = state.snapshots.find(s => s.year === year && s.month === month);
    if (snapshot) {
      results.push(snapshot);
    }
  }

  return results;
}

/**
 * Generate seed history data for the past 4 months
 * This gives the app realistic "vs last month" data from day one.
 * Based on the default finance state values with slight variance.
 */
function generateSeedHistory(): MonthlySnapshot[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const snapshots: MonthlySnapshot[] = [];

  // Base values (from default finance state)
  const baseIncome = 10150;
  const baseExpenses = 5583;
  const baseBalance = 24750;

  // Generate 4 months of history (current month - 4 through current month - 1)
  for (let i = 4; i >= 1; i--) {
    const month = (currentMonth - i + 12) % 12;
    const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

    // Add realistic variance to each month
    const incomeVariance = 1 + (Math.sin(i * 1.3) * 0.08); // ±8%
    const expenseVariance = 1 + (Math.cos(i * 0.9) * 0.12); // ±12%
    const income = Math.round(baseIncome * incomeVariance);
    const expenses = Math.round(baseExpenses * expenseVariance);
    const monthBalance = baseBalance - (i * 4200); // Approximate growth backwards
    const savingsRate = Math.round(((income - expenses) / income) * 100);

    // Category breakdowns with variance
    const categories: CategorySnapshot[] = [
      { id: '1', name: 'Housing', allocated: 2200, spent: 2200 },
      { id: '2', name: 'Food & Dining', allocated: 800, spent: Math.round(645 * (1 + Math.sin(i) * 0.15)) },
      { id: '3', name: 'Transportation', allocated: 400, spent: Math.round(312 * (1 + Math.cos(i) * 0.2)) },
      { id: '4', name: 'Entertainment', allocated: 300, spent: Math.round(187 * (1 + Math.sin(i * 2) * 0.25)) },
      { id: '5', name: 'Utilities', allocated: 350, spent: Math.round(298 * (1 + Math.cos(i * 1.5) * 0.1)) },
      { id: '6', name: 'Healthcare', allocated: 200, spent: Math.round(85 * (1 + Math.sin(i * 0.7) * 0.3)) },
      { id: '7', name: 'Shopping', allocated: 400, spent: Math.round(356 * (1 + Math.cos(i * 1.8) * 0.2)) },
      { id: '8', name: 'Savings & Investments', allocated: 1500, spent: 1500 },
    ];

    snapshots.push({
      key: `${year}-${month}`,
      month,
      year,
      income,
      expenses,
      balance: Math.max(monthBalance, 5000),
      savingsRate,
      categoryBreakdowns: categories,
      transactionCount: Math.round(12 + Math.random() * 8),
      createdAt: new Date(year, month + 1, 1).toISOString(), // Created on 1st of next month
    });
  }

  return snapshots;
}
