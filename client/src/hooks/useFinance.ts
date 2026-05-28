import { useState, useCallback } from 'react';
import {
  getFinanceState,
  addTransaction,
  addRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  makeTransactionRecurring,
  updateBudgetAllocation,
  addBudgetCategory as addBudgetCategoryToStore,
  updateBudgetCategory as updateBudgetCategoryInStore,
  deleteBudgetCategory as deleteBudgetCategoryFromStore,
  updateStartingBalance as updateBalanceInStore,
  isAppInitialized,
  initializeApp,
  resetApp,
  type FinanceState,
  type Transaction,
  type RecurringTransaction,
  type RecurringFrequency,
  type BudgetCategory,
} from '@/lib/finance-store';

export function useFinance() {
  const [initialized, setInitialized] = useState<boolean>(isAppInitialized);
  const [state, setState] = useState<FinanceState>(() => {
    if (isAppInitialized()) {
      return getFinanceState();
    }
    // Return empty state before initialization
    return {
      balance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savingsRate: 0,
      transactions: [],
      budgetCategories: [],
      forecast: [],
      recurringTransactions: [],
    };
  });

  const refresh = useCallback(() => {
    setState(getFinanceState());
  }, []);

  const initialize = useCallback((startingBalance: number) => {
    const newState = initializeApp(startingBalance);
    setState(newState);
    setInitialized(true);
  }, []);

  const reset = useCallback(() => {
    resetApp();
    setInitialized(false);
    setState({
      balance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savingsRate: 0,
      transactions: [],
      budgetCategories: [],
      forecast: [],
      recurringTransactions: [],
    });
  }, []);

  const createTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newState = addTransaction(transaction);
    setState(newState);
  }, []);

  const createRecurring = useCallback((recurring: Omit<RecurringTransaction, 'id' | 'nextDueDate' | 'isActive'>) => {
    const newState = addRecurringTransaction(recurring);
    setState(newState);
  }, []);

  const editRecurring = useCallback((id: string, updates: Partial<RecurringTransaction>) => {
    const newState = updateRecurringTransaction(id, updates);
    setState(newState);
  }, []);

  const removeRecurring = useCallback((id: string) => {
    const newState = deleteRecurringTransaction(id);
    setState(newState);
  }, []);

  const toggleRecurring = useCallback((id: string) => {
    const newState = toggleRecurringTransaction(id);
    setState(newState);
  }, []);

  const markAsRecurring = useCallback((transactionId: string, frequency: RecurringFrequency) => {
    const newState = makeTransactionRecurring(transactionId, frequency);
    setState(newState);
  }, []);

  const editBudgetAllocation = useCallback((categoryId: string, newAllocated: number) => {
    const newState = updateBudgetAllocation(categoryId, newAllocated);
    setState(newState);
  }, []);

  const updateBalance = useCallback((newBalance: number) => {
    const newState = updateBalanceInStore(newBalance);
    setState(newState);
  }, []);

  const addCategory = useCallback((category: Omit<BudgetCategory, 'id' | 'spent'>) => {
    const newState = addBudgetCategoryToStore(category);
    setState(newState);
  }, []);

  const editCategory = useCallback((categoryId: string, updates: Partial<Omit<BudgetCategory, 'id' | 'spent'>>) => {
    const newState = updateBudgetCategoryInStore(categoryId, updates);
    setState(newState);
  }, []);

  const removeCategory = useCallback((categoryId: string) => {
    const newState = deleteBudgetCategoryFromStore(categoryId);
    setState(newState);
  }, []);

  return {
    ...state,
    initialized,
    refresh,
    initialize,
    reset,
    createTransaction,
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
