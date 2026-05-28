/**
 * Recurring Transactions Page - Manage recurring income/expenses
 * Vault Design: Glass cards with toggle switches, gold accents for active items
 */
import { useState } from 'react';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { formatCurrency, getFrequencyLabel, getMonthlyEquivalent } from '@/lib/finance-store';
import type { RecurringTransaction, RecurringFrequency } from '@/lib/finance-store';
import { 
  RefreshCw, Plus, Trash2, Pause, Play, Calendar, 
  DollarSign, TrendingUp, TrendingDown, Info
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Categories are dynamic from the finance context

const frequencies: { value: RecurringFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function Recurring() {
  const { recurringTransactions, toggleRecurring, removeRecurring, createRecurring, budgetCategories } = useFinanceContext();
  const categories = [...budgetCategories.map(c => c.name), 'Income'];
  const [addOpen, setAddOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const activeRecurring = recurringTransactions.filter(r => r.isActive);
  const pausedRecurring = recurringTransactions.filter(r => !r.isActive);

  const totalMonthlyRecurringIncome = activeRecurring
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + getMonthlyEquivalent(r.amount, r.frequency), 0);

  const totalMonthlyRecurringExpenses = activeRecurring
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + getMonthlyEquivalent(r.amount, r.frequency), 0);

  const handleAdd = () => {
    if (!description || !amount || !category) {
      toast.error('Please fill in all fields');
      return;
    }

    createRecurring({
      description,
      amount: parseFloat(amount),
      category,
      type,
      frequency,
      startDate,
    });

    toast.success('Recurring transaction created');
    setDescription('');
    setAmount('');
    setCategory('');
    setType('expense');
    setFrequency('monthly');
    setAddOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    removeRecurring(id);
    toast.success(`"${name}" removed`);
  };

  return (
    <div className="pb-24 safe-top">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-gold" />
          <h1 className="font-display text-2xl text-foreground">Recurring</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Auto-populated transactions for forecasting</p>
      </header>

      {/* Summary Cards */}
      <section className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly Income</span>
          </div>
          <p className="font-display text-xl text-success">{formatCurrency(totalMonthlyRecurringIncome)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {activeRecurring.filter(r => r.type === 'income').length} active
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-danger" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly Bills</span>
          </div>
          <p className="font-display text-xl text-foreground">{formatCurrency(totalMonthlyRecurringExpenses)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {activeRecurring.filter(r => r.type === 'expense').length} active
          </p>
        </div>
      </section>

      {/* Info Banner */}
      <section className="px-4 mt-4">
        <div className="glass-card p-3 border-l-2 border-l-gold flex items-start gap-2.5">
          <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Recurring transactions automatically populate in future months and are factored into your 12-month cash flow forecast.
          </p>
        </div>
      </section>

      {/* Active Recurring */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Active ({activeRecurring.length})
          </h2>
          <Drawer open={addOpen} onOpenChange={setAddOpen}>
            <DrawerTrigger asChild>
              <Button size="sm" className="h-8 bg-gold text-navy-dark hover:bg-gold-light text-xs font-medium">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add New
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card border-border">
              <DrawerHeader>
                <DrawerTitle className="font-display text-xl text-foreground">New Recurring Transaction</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8 space-y-4">
                {/* Type Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      type === 'expense' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    onClick={() => setType('income')}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      type === 'income' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold font-display text-lg">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 h-12 text-lg font-mono bg-input border-border focus:border-gold focus:ring-gold/20"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                  <Input
                    placeholder="e.g., Netflix, Rent, Salary"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-11 bg-input border-border focus:border-gold focus:ring-gold/20"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Frequency</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                    <SelectTrigger className="h-11 bg-input border-border focus:border-gold focus:ring-gold/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {frequencies.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11 bg-input border-border focus:border-gold focus:ring-gold/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 bg-input border-border focus:border-gold focus:ring-gold/20"
                  />
                </div>

                {/* Monthly equivalent preview */}
                {amount && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Monthly equivalent: <span className="text-gold font-mono font-medium">
                        {formatCurrency(getMonthlyEquivalent(parseFloat(amount) || 0, frequency))}
                      </span>
                    </p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  onClick={handleAdd}
                  className="w-full h-12 bg-gold text-navy-dark font-semibold hover:bg-gold-light active:scale-[0.98] transition-all duration-160"
                >
                  Create Recurring {type === 'income' ? 'Income' : 'Expense'}
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="space-y-2.5 stagger-enter">
          {activeRecurring.map((rt) => (
            <RecurringCard
              key={rt.id}
              recurring={rt}
              onToggle={() => toggleRecurring(rt.id)}
              onDelete={() => handleDelete(rt.id, rt.description)}
            />
          ))}
          {activeRecurring.length === 0 && (
            <div className="glass-card p-6 text-center">
              <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No active recurring transactions</p>
              <p className="text-xs text-muted-foreground mt-1">Add one to improve your forecast accuracy</p>
            </div>
          )}
        </div>
      </section>

      {/* Paused Recurring */}
      {pausedRecurring.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Paused ({pausedRecurring.length})
          </h2>
          <div className="space-y-2.5">
            {pausedRecurring.map((rt) => (
              <RecurringCard
                key={rt.id}
                recurring={rt}
                onToggle={() => toggleRecurring(rt.id)}
                onDelete={() => handleDelete(rt.id, rt.description)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Sub-component for recurring transaction card
function RecurringCard({ 
  recurring, 
  onToggle, 
  onDelete 
}: { 
  recurring: RecurringTransaction; 
  onToggle: () => void; 
  onDelete: () => void;
}) {
  const isIncome = recurring.type === 'income';
  const monthlyAmount = getMonthlyEquivalent(recurring.amount, recurring.frequency);

  return (
    <div className={`glass-card p-4 transition-opacity duration-200 ${!recurring.isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isIncome ? 'bg-success/10' : 'bg-gold/10'
        }`}>
          {isIncome ? (
            <DollarSign className="w-4.5 h-4.5 text-success" />
          ) : (
            <RefreshCw className="w-4.5 h-4.5 text-gold" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">{recurring.description}</p>
            {recurring.isActive && (
              <span className="px-1.5 py-0.5 bg-success/10 text-success text-[9px] font-medium rounded uppercase tracking-wider shrink-0">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{recurring.category}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{getFrequencyLabel(recurring.frequency)}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`font-mono text-sm font-medium ${isIncome ? 'text-success' : 'text-foreground'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(recurring.amount)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ≈ {formatCurrency(monthlyAmount)}/mo
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Next: {new Date(recurring.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Switch
            checked={recurring.isActive}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-gold"
          />
          <button
            onClick={onDelete}
            className="p-1.5 text-muted-foreground hover:text-danger transition-colors rounded-md hover:bg-danger/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
