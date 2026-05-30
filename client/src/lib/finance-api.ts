import { api } from './api';
import type { Transaction, RecurringTransaction } from './finance-store';

export interface ApiBudgetCategory {
  id: string;
  name: string;
  allocated: number;
  color: string;
  icon: string;
}

export interface FullState {
  settings: {
    startingBalance: number;
    isInitialized: boolean;
  };
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  budgetCategories: ApiBudgetCategory[];
}

export function getFullState(): Promise<FullState> {
  return api.get<FullState>('/settings/state');
}

export function initializeApp(
  startingBalance: number,
): Promise<{ startingBalance: number; isInitialized: boolean }> {
  return api.post('/settings/initialize', { startingBalance });
}

export function addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  return api.post<Transaction>('/transactions', tx);
}

export function deleteTransaction(id: string): Promise<{ message: string }> {
  return api.delete(`/transactions/${id}`);
}

export function addRecurring(
  r: Omit<RecurringTransaction, 'id' | 'nextDueDate' | 'isActive'>,
): Promise<RecurringTransaction> {
  return api.post<RecurringTransaction>('/recurring', r);
}

export function updateRecurring(
  id: string,
  updates: Partial<RecurringTransaction>,
): Promise<RecurringTransaction> {
  return api.put<RecurringTransaction>(`/recurring/${id}`, updates);
}

export function deleteRecurring(id: string): Promise<{ message: string }> {
  return api.delete(`/recurring/${id}`);
}

export function toggleRecurring(id: string): Promise<RecurringTransaction> {
  return api.patch<RecurringTransaction>(`/recurring/${id}/toggle`);
}

export function generateFromRecurring(
  id: string,
): Promise<{ transaction: Transaction; recurring: RecurringTransaction }> {
  return api.post(`/recurring/${id}/generate`, {});
}

export function addCategory(cat: Omit<ApiBudgetCategory, 'id'>): Promise<ApiBudgetCategory> {
  return api.post<ApiBudgetCategory>('/budget-categories', cat);
}

export function updateCategory(
  id: string,
  updates: Partial<Omit<ApiBudgetCategory, 'id'>>,
): Promise<ApiBudgetCategory> {
  return api.put<ApiBudgetCategory>(`/budget-categories/${id}`, updates);
}

export function deleteCategory(id: string): Promise<{ message: string }> {
  return api.delete(`/budget-categories/${id}`);
}

export function updateBalance(startingBalance: number): Promise<{ startingBalance: number }> {
  return api.put('/settings/balance', { startingBalance });
}

export function resetApp(): Promise<{ message: string }> {
  return api.delete('/settings/reset');
}
