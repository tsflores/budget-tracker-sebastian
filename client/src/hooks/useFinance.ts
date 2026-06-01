import { useState, useCallback, useEffect } from 'react';
import * as financeApi from '@/lib/finance-api';
import {
  generateForecast,
  type Transaction,
  type RecurringTransaction,
  type RecurringFrequency,
  type BudgetCategory,
  type FinanceState,
} from '@/lib/finance-store';
import type { FullState } from '@/lib/finance-api';

const EMPTY_STATE: FinanceState = {
  balance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  savingsRate: 0,
  transactions: [],
  budgetCategories: [],
  forecast: [],
  recurringTransactions: [],
};

function deriveState(raw: FullState): FinanceState {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = now.getMonth();

  const monthTxs = raw.transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === yr && d.getMonth() === mo;
  });

  const monthlyIncome = monthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const savingsRate = monthlyIncome > 0
    ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
    : 0;

  const spentByCategory: Record<string, number> = {};
  monthTxs
    .filter(t => t.type === 'expense')
    .forEach(t => { spentByCategory[t.category] = (spentByCategory[t.category] ?? 0) + t.amount; });

  const budgetCategories: BudgetCategory[] = raw.budgetCategories.map(cat => ({
    ...cat,
    spent: spentByCategory[cat.name] ?? 0,
  }));

  const balance = raw.settings.startingBalance;
  const forecast = generateForecast(
    balance, monthlyIncome, monthlyExpenses,
    raw.recurringTransactions, budgetCategories,
  );

  return {
    balance,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    transactions: raw.transactions,
    budgetCategories,
    recurringTransactions: raw.recurringTransactions,
    forecast,
  };
}

export function useFinance() {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<FinanceState>(EMPTY_STATE);

  const load = useCallback(async () => {
    try {
      const raw = await financeApi.getFullState();
      setState(deriveState(raw));
      setInitialized(raw.settings.isInitialized);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(() => { load(); }, [load]);

  const initialize = useCallback(async (startingBalance: number) => {
    await financeApi.initializeApp(startingBalance);
    await load();
  }, [load]);

  const reset = useCallback(async () => {
    await financeApi.resetApp();
    setState(EMPTY_STATE);
    setInitialized(false);
  }, []);

  const createTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    await financeApi.addTransaction(transaction);
    await load();
  }, [load]);

  const removeTransaction = useCallback(async (id: string) => {
    await financeApi.deleteTransaction(id);
    await load();
  }, [load]);

  const createRecurring = useCallback(async (recurring: Omit<RecurringTransaction, 'id' | 'nextDueDate' | 'isActive'>) => {
    await financeApi.addRecurring(recurring);
    await load();
  }, [load]);

  const editRecurring = useCallback(async (id: string, updates: Partial<RecurringTransaction>) => {
    await financeApi.updateRecurring(id, updates);
    await load();
  }, [load]);

  const removeRecurring = useCallback(async (id: string) => {
    await financeApi.deleteRecurring(id);
    await load();
  }, [load]);

  const toggleRecurring = useCallback(async (id: string) => {
    await financeApi.toggleRecurring(id);
    await load();
  }, [load]);

  const markAsRecurring = useCallback(async (transactionId: string, frequency: RecurringFrequency) => {
    const tx = state.transactions.find(t => t.id === transactionId);
    if (!tx) return;
    await financeApi.addRecurring({
      description: tx.description,
      amount: tx.amount,
      category: tx.category,
      type: tx.type,
      frequency,
      startDate: tx.date,
    });
    await load();
  }, [state.transactions, load]);

  const editBudgetAllocation = useCallback(async (categoryId: string, newAllocated: number) => {
    await financeApi.updateCategory(categoryId, { allocated: newAllocated });
    await load();
  }, [load]);

  const updateBalance = useCallback(async (newBalance: number) => {
    await financeApi.updateBalance(newBalance);
    await load();
  }, [load]);

  const addCategory = useCallback(async (category: Omit<BudgetCategory, 'id' | 'spent'>) => {
    await financeApi.addCategory(category);
    await load();
  }, [load]);

  const editCategory = useCallback(async (categoryId: string, updates: Partial<Omit<BudgetCategory, 'id' | 'spent'>>) => {
    await financeApi.updateCategory(categoryId, updates);
    await load();
  }, [load]);

  const removeCategory = useCallback(async (categoryId: string) => {
    await financeApi.deleteCategory(categoryId);
    await load();
  }, [load]);

  return {
    ...state,
    initialized,
    isLoading,
    refresh,
    initialize,
    reset,
    createTransaction,
    removeTransaction,
    createRecurring,
    editRecurring,
    removeRecurring,
    toggleRecurring,
    markAsRecurring,
    editBudgetAllocation,
    updateBalance,
    addCategory,
    editCategory,
    removeCategory,
  };
}
