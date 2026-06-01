import { createContext, useContext, type ReactNode } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useHistory } from '@/hooks/useHistory';
import type { FinanceState, Transaction, RecurringTransaction, RecurringFrequency, BudgetCategory } from '@/lib/finance-store';
import type { MonthlySnapshot } from '@/lib/history-store';

interface FinanceContextType extends FinanceState {
  initialized: boolean;
  isLoading: boolean;
  initialize: (startingBalance: number) => Promise<void>;
  reset: () => Promise<void>;
  refresh: () => void;
  createTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  createRecurring: (recurring: Omit<RecurringTransaction, 'id' | 'nextDueDate' | 'isActive'>) => Promise<void>;
  editRecurring: (id: string, updates: Partial<RecurringTransaction>) => Promise<void>;
  removeRecurring: (id: string) => Promise<void>;
  toggleRecurring: (id: string) => Promise<void>;
  markAsRecurring: (transactionId: string, frequency: RecurringFrequency) => Promise<void>;
  editBudgetAllocation: (categoryId: string, newAllocated: number) => Promise<void>;
  updateBalance: (newBalance: number) => Promise<void>;
  addCategory: (category: Omit<BudgetCategory, 'id' | 'spent'>) => Promise<void>;
  editCategory: (categoryId: string, updates: Partial<Omit<BudgetCategory, 'id' | 'spent'>>) => Promise<void>;
  removeCategory: (categoryId: string) => Promise<void>;
  // History
  previousMonth: MonthlySnapshot | null;
  snapshots: MonthlySnapshot[];
  getTrend: (currentValue: number, metricKey: 'income' | 'expenses' | 'balance' | 'savingsRate') => {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    available: boolean;
  };
  takeSnapshot: (state: FinanceState) => Promise<void>;
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
