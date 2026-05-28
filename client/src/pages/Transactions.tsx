/**
 * Transactions Page - Full transaction history with search and filters
 * Vault Design: Searchable list with category filters, glass card rows
 */
import { useState, useMemo } from 'react';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { TransactionItem } from '@/components/TransactionItem';
import { formatCurrency } from '@/lib/finance-store';
import { Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';

const filterOptions = ['All', 'Income', 'Expense', 'Recurring'] as const;
type FilterType = typeof filterOptions[number];

export default function Transactions() {
  const { transactions, markAsRecurring } = useFinanceContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('All');
  const [sortNewest, setSortNewest] = useState(true);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filter === 'Income') {
      filtered = filtered.filter(t => t.type === 'income');
    } else if (filter === 'Expense') {
      filtered = filtered.filter(t => t.type === 'expense');
    } else if (filter === 'Recurring') {
      filtered = filtered.filter(t => t.isRecurring);
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [transactions, search, filter, sortNewest]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="pb-24 safe-top">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <h1 className="font-display text-2xl text-foreground">Transactions</h1>
        <p className="text-xs text-muted-foreground mt-1">{transactions.length} total transactions</p>
      </header>

      {/* Summary Cards */}
      <section className="px-4 mt-3 flex gap-3">
        <div className="flex-1 glass-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total In</p>
          <p className="font-mono text-lg text-success mt-0.5">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="flex-1 glass-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Out</p>
          <p className="font-mono text-lg text-foreground mt-0.5">{formatCurrency(totalExpenses)}</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-4 mt-5 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-input border-border focus:border-gold focus:ring-gold/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 p-0.5 bg-muted rounded-lg">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  filter === opt 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortNewest(!sortNewest)}
            className="ml-auto p-2 rounded-lg hover:bg-accent transition-colors"
            title={sortNewest ? 'Newest first' : 'Oldest first'}
          >
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </section>

      {/* Transaction List */}
      <section className="px-4 mt-4">
        {filteredTransactions.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground text-sm">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="glass-card p-2 space-y-0.5">
            {filteredTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} onMakeRecurring={markAsRecurring} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
