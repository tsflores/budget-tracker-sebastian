/**
 * Finance Store - Local state management for the finance dashboard
 * Uses localStorage for persistence in this PWA-only architecture
 * Includes recurring transaction support with auto-population
 */

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  isRecurring?: boolean;
  recurringId?: string; // links to the RecurringTransaction that generated it
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string; // optional end date
  nextDueDate: string;
  isActive: boolean;
  lastGenerated?: string; // last date a transaction was auto-generated
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
}

export interface ForecastMonth {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
  cumulativeBalance: number;
  recurringIncome: number;
  recurringExpenses: number;
}

export interface FinanceState {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  transactions: Transaction[];
  budgetCategories: BudgetCategory[];
  forecast: ForecastMonth[];
  recurringTransactions: RecurringTransaction[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Calculate how many times a recurring transaction occurs in a given month
 */
function getRecurringOccurrencesInMonth(
  recurring: RecurringTransaction,
  year: number,
  month: number
): number {
  if (!recurring.isActive) return 0;

  const startDate = new Date(recurring.startDate);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  // Check if recurring has started yet
  if (startDate > monthEnd) return 0;

  // Check if recurring has ended
  if (recurring.endDate) {
    const endDate = new Date(recurring.endDate);
    if (endDate < monthStart) return 0;
  }

  switch (recurring.frequency) {
    case 'weekly':
      return 4; // approximate
    case 'biweekly':
      return 2;
    case 'monthly':
      return 1;
    case 'quarterly':
      // Occurs if month aligns with quarterly schedule from start
      const monthsDiff = (year - startDate.getFullYear()) * 12 + (month - startDate.getMonth());
      return monthsDiff >= 0 && monthsDiff % 3 === 0 ? 1 : 0;
    case 'yearly':
      return month === startDate.getMonth() ? 1 : 0;
    default:
      return 0;
  }
}

/**
 * Generate forecast using recurring transactions for accurate projections
 */
function generateForecast(
  balance: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  recurringTransactions: RecurringTransaction[],
  budgetCategories?: BudgetCategory[]
): ForecastMonth[] {
  // If budget categories provided, use total allocated as projected expenses baseline
  const budgetBasedExpenses = budgetCategories
    ? budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0)
    : monthlyExpenses;
  const now = new Date();
  const forecast: ForecastMonth[] = [];
  let cumulative = balance;

  for (let i = 0; i < 12; i++) {
    const monthIndex = (now.getMonth() + i) % 12;
    const year = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
    const month = `${MONTHS[monthIndex]} ${year}`;

    // Calculate recurring amounts for this month
    let recurringIncome = 0;
    let recurringExpenses = 0;

    for (const rt of recurringTransactions) {
      const occurrences = getRecurringOccurrencesInMonth(rt, year, monthIndex);
      const total = rt.amount * occurrences;
      if (rt.type === 'income') {
        recurringIncome += total;
      } else {
        recurringExpenses += total;
      }
    }

    // Non-recurring base (subtract recurring from current monthly to avoid double-counting)
    const activeRecurringIncome = recurringTransactions
      .filter(r => r.isActive && r.type === 'income')
      .reduce((sum, r) => {
        const occ = getRecurringOccurrencesInMonth(r, now.getFullYear(), now.getMonth());
        return sum + r.amount * occ;
      }, 0);
    
    const activeRecurringExpenses = recurringTransactions
      .filter(r => r.isActive && r.type === 'expense')
      .reduce((sum, r) => {
        const occ = getRecurringOccurrencesInMonth(r, now.getFullYear(), now.getMonth());
        return sum + r.amount * occ;
      }, 0);

    const baseIncome = Math.max(0, monthlyIncome - activeRecurringIncome);
    const baseExpenses = Math.max(0, budgetBasedExpenses - activeRecurringExpenses);

    // Add variance to non-recurring portion
    const incomeVariance = 1 + (Math.sin(i * 0.8) * 0.05);
    const expenseVariance = 1 + (Math.cos(i * 1.2) * 0.08);

    const projectedIncome = Math.round(baseIncome * incomeVariance + recurringIncome);
    const projectedExpenses = Math.round(baseExpenses * expenseVariance + recurringExpenses);
    const netCashFlow = projectedIncome - projectedExpenses;
    cumulative += netCashFlow;

    forecast.push({
      month,
      projectedIncome,
      projectedExpenses,
      netCashFlow,
      cumulativeBalance: cumulative,
      recurringIncome,
      recurringExpenses,
    });
  }

  return forecast;
}

/**
 * Calculate the next due date based on frequency
 */
export function getNextDueDate(currentDate: string, frequency: RecurringFrequency): string {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Get a human-readable label for frequency
 */
export function getFrequencyLabel(frequency: RecurringFrequency): string {
  const labels: Record<RecurringFrequency, string> = {
    weekly: 'Weekly',
    biweekly: 'Every 2 weeks',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  };
  return labels[frequency];
}

/**
 * Calculate monthly equivalent amount for a recurring transaction
 */
export function getMonthlyEquivalent(amount: number, frequency: RecurringFrequency): number {
  switch (frequency) {
    case 'weekly': return amount * 4.33;
    case 'biweekly': return amount * 2.17;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
  }
}

const defaultBudgetCategories: BudgetCategory[] = [
  { id: '1', name: 'Housing', allocated: 2200, spent: 2200, color: '#B5A167', icon: 'Home' },
  { id: '2', name: 'Food & Dining', allocated: 800, spent: 645, color: '#4A90D9', icon: 'UtensilsCrossed' },
  { id: '3', name: 'Transportation', allocated: 400, spent: 312, color: '#6B8E9B', icon: 'Car' },
  { id: '4', name: 'Entertainment', allocated: 300, spent: 187, color: '#8B7355', icon: 'Film' },
  { id: '5', name: 'Utilities', allocated: 350, spent: 298, color: '#5C7A8A', icon: 'Zap' },
  { id: '6', name: 'Healthcare', allocated: 200, spent: 85, color: '#7A9B6B', icon: 'Heart' },
  { id: '7', name: 'Shopping', allocated: 400, spent: 356, color: '#9B7A8B', icon: 'ShoppingBag' },
  { id: '8', name: 'Savings & Investments', allocated: 1500, spent: 1500, color: '#B5A167', icon: 'TrendingUp' },
];

const defaultRecurringTransactions: RecurringTransaction[] = [
  {
    id: 'r1',
    description: 'Monthly Salary',
    amount: 8500,
    category: 'Income',
    type: 'income',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-06-01',
    isActive: true,
  },
  {
    id: 'r2',
    description: 'Rent Payment',
    amount: 2200,
    category: 'Housing',
    type: 'expense',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-06-01',
    isActive: true,
  },
  {
    id: 'r3',
    description: 'Netflix Subscription',
    amount: 15.99,
    category: 'Entertainment',
    type: 'expense',
    frequency: 'monthly',
    startDate: '2026-01-15',
    nextDueDate: '2026-06-15',
    isActive: true,
  },
  {
    id: 'r4',
    description: 'Gym Membership',
    amount: 49.99,
    category: 'Healthcare',
    type: 'expense',
    frequency: 'monthly',
    startDate: '2026-02-01',
    nextDueDate: '2026-06-01',
    isActive: true,
  },
  {
    id: 'r5',
    description: 'Spotify Premium',
    amount: 10.99,
    category: 'Entertainment',
    type: 'expense',
    frequency: 'monthly',
    startDate: '2026-01-16',
    nextDueDate: '2026-06-16',
    isActive: true,
  },
  {
    id: 'r6',
    description: 'Investment Transfer',
    amount: 1500,
    category: 'Savings & Investments',
    type: 'expense',
    frequency: 'monthly',
    startDate: '2026-01-21',
    nextDueDate: '2026-06-21',
    isActive: true,
  },
  {
    id: 'r7',
    description: 'Freelance Retainer',
    amount: 1200,
    category: 'Income',
    type: 'income',
    frequency: 'biweekly',
    startDate: '2026-03-01',
    nextDueDate: '2026-06-05',
    isActive: true,
  },
];

const defaultTransactions: Transaction[] = [
  { id: '1', date: '2026-05-28', description: 'Monthly Salary', amount: 8500, category: 'Income', type: 'income', isRecurring: true, recurringId: 'r1' },
  { id: '2', date: '2026-05-27', description: 'Rent Payment', amount: 2200, category: 'Housing', type: 'expense', isRecurring: true, recurringId: 'r2' },
  { id: '3', date: '2026-05-26', description: 'Whole Foods Market', amount: 127.43, category: 'Food & Dining', type: 'expense' },
  { id: '4', date: '2026-05-25', description: 'Tesla Supercharger', amount: 34.50, category: 'Transportation', type: 'expense' },
  { id: '5', date: '2026-05-25', description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', type: 'expense', isRecurring: true, recurringId: 'r3' },
  { id: '6', date: '2026-05-24', description: 'Freelance Retainer', amount: 1200, category: 'Income', type: 'income', isRecurring: true, recurringId: 'r7' },
  { id: '7', date: '2026-05-24', description: 'Electric Bill', amount: 89.00, category: 'Utilities', type: 'expense' },
  { id: '8', date: '2026-05-23', description: 'Amazon Purchase', amount: 67.99, category: 'Shopping', type: 'expense' },
  { id: '9', date: '2026-05-22', description: 'Gym Membership', amount: 49.99, category: 'Healthcare', type: 'expense', isRecurring: true, recurringId: 'r4' },
  { id: '10', date: '2026-05-21', description: 'Investment Transfer', amount: 1500, category: 'Savings & Investments', type: 'expense', isRecurring: true, recurringId: 'r6' },
  { id: '11', date: '2026-05-20', description: 'Uber Ride', amount: 24.50, category: 'Transportation', type: 'expense' },
  { id: '12', date: '2026-05-19', description: 'Dinner Out - Sushi', amount: 78.00, category: 'Food & Dining', type: 'expense' },
  { id: '13', date: '2026-05-18', description: 'Side Project Income', amount: 450, category: 'Income', type: 'income' },
  { id: '14', date: '2026-05-17', description: 'Gas Station', amount: 52.00, category: 'Transportation', type: 'expense' },
  { id: '15', date: '2026-05-16', description: 'Spotify Premium', amount: 10.99, category: 'Entertainment', type: 'expense', isRecurring: true, recurringId: 'r5' },
];

const STORAGE_KEY = 'financeflow_data_v2';
const INITIALIZED_KEY = 'financeflow_initialized';

/**
 * Check if the app has been initialized by the user
 */
export function isAppInitialized(): boolean {
  return localStorage.getItem(INITIALIZED_KEY) === 'true';
}

/**
 * Initialize the app with a starting balance from the user
 * Creates an empty state with only the starting balance set
 */
export function initializeApp(startingBalance: number): FinanceState {
  const state: FinanceState = {
    balance: startingBalance,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    transactions: [],
    budgetCategories: [
      { id: '1', name: 'Housing', allocated: 0, spent: 0, color: '#B5A167', icon: 'Home' },
      { id: '2', name: 'Food & Dining', allocated: 0, spent: 0, color: '#4A90D9', icon: 'UtensilsCrossed' },
      { id: '3', name: 'Transportation', allocated: 0, spent: 0, color: '#6B8E9B', icon: 'Car' },
      { id: '4', name: 'Entertainment', allocated: 0, spent: 0, color: '#8B7355', icon: 'Film' },
      { id: '5', name: 'Utilities', allocated: 0, spent: 0, color: '#5C7A8A', icon: 'Zap' },
      { id: '6', name: 'Healthcare', allocated: 0, spent: 0, color: '#7A9B6B', icon: 'Heart' },
      { id: '7', name: 'Shopping', allocated: 0, spent: 0, color: '#9B7A8B', icon: 'ShoppingBag' },
      { id: '8', name: 'Savings & Investments', allocated: 0, spent: 0, color: '#B5A167', icon: 'TrendingUp' },
    ],
    forecast: generateForecast(startingBalance, 0, 0, []),
    recurringTransactions: [],
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(INITIALIZED_KEY, 'true');
  return state;
}

/**
 * Reset the app completely (for testing or re-initialization)
 */
export function resetApp(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(INITIALIZED_KEY);
  localStorage.removeItem('financeflow_history_v1');
  localStorage.removeItem('financeflow_onboarding_complete');
}

export function getFinanceState(): FinanceState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure recurringTransactions exists (migration)
      if (!parsed.recurringTransactions) {
        parsed.recurringTransactions = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    // Fall through to defaults
  }

  // Return empty state if not initialized (should not normally reach here)
  const state: FinanceState = {
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    transactions: [],
    budgetCategories: [],
    forecast: [],
    recurringTransactions: [],
  };

  return state;
}

export function saveFinanceState(state: FinanceState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addTransaction(transaction: Omit<Transaction, 'id'>): FinanceState {
  const state = getFinanceState();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  state.transactions = [newTransaction, ...state.transactions];
  
  // Update balance
  if (transaction.type === 'income') {
    state.balance += transaction.amount;
    state.monthlyIncome += transaction.amount;
  } else {
    state.balance -= transaction.amount;
    state.monthlyExpenses += transaction.amount;
  }
  
  // Update budget category spent
  const category = state.budgetCategories.find(c => c.name === transaction.category);
  if (category && transaction.type === 'expense') {
    category.spent += transaction.amount;
  }

  // Recalculate forecast
  state.forecast = generateForecast(state.balance, state.monthlyIncome, state.monthlyExpenses, state.recurringTransactions, state.budgetCategories);
  state.savingsRate = Math.round(((state.monthlyIncome - state.monthlyExpenses) / state.monthlyIncome) * 100);
  
  saveFinanceState(state);
  return state;
}

export function addRecurringTransaction(recurring: Omit<RecurringTransaction, 'id' | 'nextDueDate' | 'isActive'>): FinanceState {
  const state = getFinanceState();
  const newRecurring: RecurringTransaction = {
    ...recurring,
    id: `r_${Date.now()}`,
    nextDueDate: getNextDueDate(recurring.startDate, recurring.frequency),
    isActive: true,
  };
  state.recurringTransactions = [...state.recurringTransactions, newRecurring];

  // Recalculate forecast with new recurring
  state.forecast = generateForecast(state.balance, state.monthlyIncome, state.monthlyExpenses, state.recurringTransactions, state.budgetCategories);
  
  saveFinanceState(state);
  return state;
}

export function updateRecurringTransaction(id: string, updates: Partial<RecurringTransaction>): FinanceState {
  const state = getFinanceState();
  state.recurringTransactions = state.recurringTransactions.map(rt =>
    rt.id === id ? { ...rt, ...updates } : rt
  );

  // Recalculate forecast
  state.forecast = generateForecast(state.balance, state.monthlyIncome, state.monthlyExpenses, state.recurringTransactions, state.budgetCategories);
  
  saveFinanceState(state);
  return state;
}

export function deleteRecurringTransaction(id: string): FinanceState {
  const state = getFinanceState();
  state.recurringTransactions = state.recurringTransactions.filter(rt => rt.id !== id);

  // Recalculate forecast
  state.forecast = generateForecast(state.balance, state.monthlyIncome, state.monthlyExpenses, state.recurringTransactions, state.budgetCategories);
  
  saveFinanceState(state);
  return state;
}

export function toggleRecurringTransaction(id: string): FinanceState {
  const state = getFinanceState();
  state.recurringTransactions = state.recurringTransactions.map(rt =>
    rt.id === id ? { ...rt, isActive: !rt.isActive } : rt
  );

  // Recalculate forecast
  state.forecast = generateForecast(state.balance, state.monthlyIncome, state.monthlyExpenses, state.recurringTransactions, state.budgetCategories);
  
  saveFinanceState(state);
  return state;
}

/**
 * Convert an existing one-time transaction into a recurring one
 */
export function makeTransactionRecurring(
  transactionId: string,
  frequency: RecurringFrequency
): FinanceState {
  const state = getFinanceState();
  const transaction = state.transactions.find(t => t.id === transactionId);
  
  if (!transaction) return state;

  // Create the recurring transaction
  const newRecurring: RecurringTransaction = {
    id: `r_${Date.now()}`,
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
    type: transaction.type,
    frequency,
    startDate: transaction.date,
    nextDueDate: getNextDueDate(transaction.date, frequency),
    isActive: true,
  };

  state.recurringTransactions = [...state.recurringTransactions, newRecurring];

  // Mark the original transaction as recurring
  state.transactions = state.transactions.map(t =>
    t.id === transactionId ? { ...t, isRecurring: true, recurringId: newRecurring.id } : t
  );

  // Recalculate forecast
  state.forecast = generateForecast(state.balance, state.monthlyIncome, state.monthlyExpenses, state.recurringTransactions, state.budgetCategories);
  
  saveFinanceState(state);
  return state;
}

/**
 * Update a budget category's allocation and recalculate forecast
 */
export function updateBudgetAllocation(categoryId: string, newAllocated: number): FinanceState {
  const state = getFinanceState();
  state.budgetCategories = state.budgetCategories.map(cat =>
    cat.id === categoryId ? { ...cat, allocated: newAllocated } : cat
  );

  // Recalculate forecast using updated budget allocations
  state.forecast = generateForecast(
    state.balance,
    state.monthlyIncome,
    state.monthlyExpenses,
    state.recurringTransactions,
    state.budgetCategories
  );

  saveFinanceState(state);
  return state;
}

/**
 * Add a new budget category
 */
export function addBudgetCategory(category: Omit<BudgetCategory, 'id' | 'spent'>): FinanceState {
  const state = getFinanceState();
  const newCategory: BudgetCategory = {
    ...category,
    id: `cat_${Date.now()}`,
    spent: 0,
  };
  state.budgetCategories = [...state.budgetCategories, newCategory];

  // Recalculate forecast
  state.forecast = generateForecast(
    state.balance,
    state.monthlyIncome,
    state.monthlyExpenses,
    state.recurringTransactions,
    state.budgetCategories
  );

  saveFinanceState(state);
  return state;
}

/**
 * Update a budget category's details (name, color, icon, allocated)
 */
export function updateBudgetCategory(categoryId: string, updates: Partial<Omit<BudgetCategory, 'id' | 'spent'>>): FinanceState {
  const state = getFinanceState();
  const oldCategory = state.budgetCategories.find(c => c.id === categoryId);
  
  state.budgetCategories = state.budgetCategories.map(cat =>
    cat.id === categoryId ? { ...cat, ...updates } : cat
  );

  // If name changed, update transactions and recurring that reference the old name
  if (updates.name && oldCategory && oldCategory.name !== updates.name) {
    state.transactions = state.transactions.map(t =>
      t.category === oldCategory.name ? { ...t, category: updates.name! } : t
    );
    state.recurringTransactions = state.recurringTransactions.map(r =>
      r.category === oldCategory.name ? { ...r, category: updates.name! } : r
    );
  }

  // Recalculate forecast
  state.forecast = generateForecast(
    state.balance,
    state.monthlyIncome,
    state.monthlyExpenses,
    state.recurringTransactions,
    state.budgetCategories
  );

  saveFinanceState(state);
  return state;
}

/**
 * Delete a budget category
 */
export function deleteBudgetCategory(categoryId: string): FinanceState {
  const state = getFinanceState();
  state.budgetCategories = state.budgetCategories.filter(cat => cat.id !== categoryId);

  // Recalculate forecast
  state.forecast = generateForecast(
    state.balance,
    state.monthlyIncome,
    state.monthlyExpenses,
    state.recurringTransactions,
    state.budgetCategories
  );

  saveFinanceState(state);
  return state;
}

/**
 * Update the starting balance (adjusts current balance by the difference)
 */
export function updateStartingBalance(newBalance: number): FinanceState {
  const state = getFinanceState();
  state.balance = newBalance;

  // Recalculate forecast with new balance
  state.forecast = generateForecast(
    state.balance,
    state.monthlyIncome,
    state.monthlyExpenses,
    state.recurringTransactions,
    state.budgetCategories
  );

  saveFinanceState(state);
  return state;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompact(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount);
}
