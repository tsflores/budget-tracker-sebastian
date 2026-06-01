import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSnapshots, saveSnapshot as apiSaveSnapshot } from '@/lib/history-api';
import {
  createSnapshotFromState,
  calculateTrend,
  type MonthlySnapshot,
} from '@/lib/history-store';
import type { FinanceState } from '@/lib/finance-store';

interface UseHistoryReturn {
  previousMonth: MonthlySnapshot | null;
  snapshots: MonthlySnapshot[];
  getTrend: (currentValue: number, metricKey: keyof Pick<MonthlySnapshot, 'income' | 'expenses' | 'balance' | 'savingsRate'>) => {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    available: boolean;
  };
  getRange: (startYear: number, startMonth: number, count: number) => MonthlySnapshot[];
  takeSnapshot: (financeState: FinanceState) => Promise<void>;
}

export function useHistory(financeState: FinanceState): UseHistoryReturn {
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSnapshots()
      .then(data => { setSnapshots(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  // Auto-snapshot: after loading, save previous month if missing
  useEffect(() => {
    if (!loaded) return;

    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    if (snapshots.some(s => s.year === prevYear && s.month === prevMonth)) return;

    const snapshot = createSnapshotFromState(
      prevYear, prevMonth,
      financeState.monthlyIncome,
      financeState.monthlyExpenses,
      financeState.balance,
      financeState.savingsRate,
      financeState.budgetCategories.map(c => ({ id: c.id, name: c.name, allocated: c.allocated, spent: c.spent })),
      financeState.transactions.length,
    );

    apiSaveSnapshot(snapshot)
      .then(saved => {
        setSnapshots(prev => {
          const filtered = prev.filter(s => !(s.year === prevYear && s.month === prevMonth));
          return [...filtered, saved].sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
        });
      })
      .catch(() => {});
  }, [loaded]); // intentionally only runs once after initial load

  const previousMonth = useMemo(() => {
    const now = new Date();
    const pm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const py = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return snapshots.find(s => s.year === py && s.month === pm) ?? null;
  }, [snapshots]);

  const getTrend = useCallback(
    (currentValue: number, metricKey: keyof Pick<MonthlySnapshot, 'income' | 'expenses' | 'balance' | 'savingsRate'>) => {
      if (!previousMonth) return { direction: 'neutral' as const, value: '—', available: false };
      return calculateTrend(currentValue, previousMonth[metricKey]);
    },
    [previousMonth],
  );

  const getRange = useCallback(
    (startYear: number, startMonth: number, count: number) => {
      const results: MonthlySnapshot[] = [];
      for (let i = 0; i < count; i++) {
        const month = (startMonth + i) % 12;
        const year = startYear + Math.floor((startMonth + i) / 12);
        const snap = snapshots.find(s => s.year === year && s.month === month);
        if (snap) results.push(snap);
      }
      return results;
    },
    [snapshots],
  );

  const takeSnapshot = useCallback(async (state: FinanceState) => {
    const now = new Date();
    const snapshot = createSnapshotFromState(
      now.getFullYear(), now.getMonth(),
      state.monthlyIncome, state.monthlyExpenses, state.balance, state.savingsRate,
      state.budgetCategories.map(c => ({ id: c.id, name: c.name, allocated: c.allocated, spent: c.spent })),
      state.transactions.length,
    );
    const saved = await apiSaveSnapshot(snapshot);
    setSnapshots(prev => {
      const filtered = prev.filter(s => !(s.year === now.getFullYear() && s.month === now.getMonth()));
      return [...filtered, saved].sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
    });
  }, []);

  return { previousMonth, snapshots, getTrend, getRange, takeSnapshot };
}
