/**
 * AddTransactionSheet - Bottom sheet for adding new transactions
 * Vault Design: Drawer with gold accent buttons, recurring toggle
 */
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, RefreshCw } from 'lucide-react';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { toast } from 'sonner';
import type { RecurringFrequency } from '@/lib/finance-store';
import { getFrequencyLabel, getMonthlyEquivalent } from '@/lib/finance-store';

// Categories are now dynamic from the finance context

const frequencies: { value: RecurringFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export function AddTransactionSheet() {
  const { createTransaction, createRecurring, budgetCategories } = useFinanceContext();
  const dynamicCategories = [...budgetCategories.map(c => c.name), 'Income'];
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');

  const handleSubmit = () => {
    if (!description || !amount || !category) {
      toast.error('Please fill in all fields');
      return;
    }

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const parsedAmount = parseFloat(amount);

    if (isRecurring) {
      // Create both a one-time transaction and a recurring rule
      createRecurring({
        description,
        amount: parsedAmount,
        category,
        type,
        frequency,
        startDate: today,
      });
      // Also add the first occurrence as a transaction
      createTransaction({
        date: today,
        description,
        amount: parsedAmount,
        category,
        type,
        isRecurring: true,
      });
      toast.success(`Recurring ${type} created — will auto-populate ${getFrequencyLabel(frequency).toLowerCase()}`);
    } else {
      createTransaction({
        date: today,
        description,
        amount: parsedAmount,
        category,
        type,
      });
      toast.success('Transaction added successfully');
    }

    setDescription('');
    setAmount('');
    setCategory('');
    setIsRecurring(false);
    setFrequency('monthly');
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gold text-navy-dark shadow-lg gold-glow hover:bg-gold-light active:scale-95 transition-all duration-160"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-card border-border">
        <DrawerHeader>
          <DrawerTitle className="font-display text-xl text-foreground">Add Transaction</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-5">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                type === 'expense' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                type === 'income' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
            <Input
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 bg-input border-border focus:border-gold focus:ring-gold/20"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 bg-input border-border focus:border-gold focus:ring-gold/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {dynamicCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2.5">
                <RefreshCw className={`w-4 h-4 ${isRecurring ? 'text-gold' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">Make Recurring</p>
                  <p className="text-[10px] text-muted-foreground">Auto-populate in future months</p>
                </div>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                className="data-[state=checked]:bg-gold"
              />
            </div>

            {/* Frequency selector (shown when recurring) */}
            {isRecurring && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
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
                {amount && (
                  <p className="text-xs text-muted-foreground px-1">
                    Monthly impact: <span className="text-gold font-mono">
                      {type === 'income' ? '+' : '-'}${getMonthlyEquivalent(parseFloat(amount) || 0, frequency).toFixed(2)}
                    </span>/mo
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-gold text-navy-dark font-semibold hover:bg-gold-light active:scale-[0.98] transition-all duration-160"
          >
            {isRecurring ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Create Recurring {type === 'income' ? 'Income' : 'Expense'}
              </span>
            ) : (
              `Add ${type === 'income' ? 'Income' : 'Expense'}`
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
