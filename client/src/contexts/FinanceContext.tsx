import { createContext, useContext, type ReactNode } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useHistory } from '@/hooks/useHistory';
import type { FinanceState, Transaction, RecurringTransaction, RecurringFrequency, BudgetCategory } from '@/lib/finance-store';
import type { MonthlySnapshot } from '@/lib/history-store';

interface FinanceContextType extends FinanceState {
  initialized: boolean;
  initialize: (startingBalance: number) => void;
  reset: () => void;
  refresh: () => void;
  createTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  createRecurring: (recurring: Omit<RecurringTransaction, 'id' | 'nextDueDate' | 'isActive'>) => void;
  editRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
  removeRecurring: (id: string) => void;
  toggleRecurring: (id: string) => void;
  markAsRecurring: (transactionId: string, frequency: RecurringFrequency) => void;
  editBudgetAllocation: (categoryId: string, newAllocated: number) => void;
  updateBalance: (newBalance: number) => void;
  addCategory: (category: Omit<BudgetCategory, 'id' | 'spent'>) => void;
  editCategory: (categoryId: string, updates: Partial<Omit<BudgetCategory, 'id' | 'spent'>>) => void;
  removeCategory: (categoryId: string) => void;
  // History
  previousMonth: MonthlySnapshot | null;
  snapshots: MonthlySnapshot[];
  getTrend: (currentValue: number, metricKey: 'income' | 'expenses' | 'balance' | 'savingsRate') => {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    available: boolean;
  };
  takeSnapshot: (state: FinanceState) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const finance = useFinance();
  const history = useHistory(finance);

  return (
    <FinanceContext.Provider value={{
      ...finance,
      previousMonth: history.previousMonth,
      snapshots: history.snapshots,
      getTrend: history.getTrend,
      takeSnapshot: history.takeSnapshot,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
}
