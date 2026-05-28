/**
 * useHistory - Hook for monthly history tracking and trend calculations
 * 
 * Responsibilities:
 * - Auto-snapshots the previous month on app load (if month boundary crossed)
 * - Provides the previous month's snapshot for trend comparisons
 * - Exposes trend calculation helpers
 * - Manages manual snapshot creation
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getHistoryState,
  checkAutoSnapshot,
  saveSnapshot,
  getPreviousMonthSnapshot,
  createSnapshotFromState,
  calculateTrend,
  getSnapshotRange,
  type MonthlySnapshot,
  type HistoryState,
} from '@/lib/history-store';
import type { FinanceState } from '@/lib/finance-store';

interface UseHistoryReturn {
  /** The previous month's snapshot (or null if not available) */
  previousMonth: MonthlySnapshot | null;
  /** All stored snapshots */
  snapshots: MonthlySnapshot[];
  /** Calculate trend between current and previous month values */
  getTrend: (currentValue: number, metricKey: keyof Pick<MonthlySnapshot, 'income' | 'expenses' | 'balance' | 'savingsRate'>) => {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    available: boolean;
  };
  /** Get snapshots for a range of months */
  getRange: (startYear: number, startMonth: number, count: number) => MonthlySnapshot[];
  /** Manually trigger a snapshot of the current state */
  takeSnapshot: (financeState: FinanceState) => void;
}

export function useHistory(financeState: FinanceState): UseHistoryReturn {
  const [historyState, setHistoryState] = useState<HistoryState>(getHistoryState);

  // Auto-snapshot check on mount
  useEffect(() => {
    const needsSnapshot = checkAutoSnapshot();
    
    if (needsSnapshot) {
      // We need to snapshot the previous month using the current state as a proxy
      // In a real app with MongoDB, you'd query the actual previous month's aggregated data
      // For now, we use the current state values (which represent the most recent month)
      const snapshot = createSnapshotFromState(
        needsSnapshot.year,
        needsSnapshot.month,
        financeState.monthlyIncome,
        financeState.monthlyExpenses,
        financeState.balance,
        financeState.savingsRate,
        financeState.budgetCategories.map(c => ({
          id: c.id,
          name: c.name,
          allocated: c.allocated,
          spent: c.spent,
        })),
        financeState.transactions.length
      );

      const newState = saveSnapshot(snapshot);
      setHistoryState(newState);
    }
  }, []); // Only on mount

  // Get previous month's snapshot
  const previousMonth = useMemo(() => {
    const now = new Date();
    return getPreviousMonthSnapshot(now.getFullYear(), now.getMonth());
  }, [historyState]);

  // Trend calculator
  const getTrend = useCallback(
    (currentValue: number, metricKey: keyof Pick<MonthlySnapshot, 'income' | 'expenses' | 'balance' | 'savingsRate'>) => {
      if (!previousMonth) {
        return { direction: 'neutral' as const, value: '—', available: false };
      }
      return calculateTrend(currentValue, previousMonth[metricKey]);
    },
    [previousMonth]
  );

  // Range getter
  const getRange = useCallback(
    (startYear: number, startMonth: number, count: number) => {
      return getSnapshotRange(startYear, startMonth, count);
    },
    [historyState]
  );

  // Manual snapshot
  const takeSnapshot = useCallback(
    (state: FinanceState) => {
      const now = new Date();
      const snapshot = createSnapshotFromState(
        now.getFullYear(),
        now.getMonth(),
        state.monthlyIncome,
        state.monthlyExpenses,
        state.balance,
        state.savingsRate,
        state.budgetCategories.map(c => ({
          id: c.id,
          name: c.name,
          allocated: c.allocated,
          spent: c.spent,
        })),
        state.transactions.length
      );

      const newState = saveSnapshot(snapshot);
      setHistoryState(newState);
    },
    []
  );

  return {
    previousMonth,
    snapshots: historyState.snapshots,
    getTrend,
    getRange,
    takeSnapshot,
  };
}
