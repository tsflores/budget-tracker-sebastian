/**
 * TransactionItem - Individual transaction row with recurring support
 * Vault Design: Clean row with category icon, recurring badge, context actions
 */
import { useState } from 'react';
import { DollarSign, RefreshCw, MoreVertical, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/finance-store';
import type { Transaction, RecurringFrequency } from '@/lib/finance-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { resolveIcon } from '@/components/CategoryManageDrawer';
import { useFinanceContext } from '@/contexts/FinanceContext';

const frequencyOptions: { value: RecurringFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

interface TransactionItemProps {
  transaction: Transaction;
  onMakeRecurring?: (transactionId: string, frequency: RecurringFrequency) => void;
  onDelete?: (transactionId: string) => void;
}

export function TransactionItem({ transaction, onMakeRecurring, onDelete }: TransactionItemProps) {
  const { budgetCategories } = useFinanceContext();
  const matchedCategory = budgetCategories.find(c => c.name === transaction.category);
  const Icon = matchedCategory ? resolveIcon(matchedCategory.icon) : DollarSign;
  const isIncome = transaction.type === 'income';
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formattedDate = new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const handleMakeRecurring = (frequency: RecurringFrequency) => {
    onMakeRecurring?.(transaction.id, frequency);
    setPopoverOpen(false);
  };

  const handleDelete = () => {
    onDelete?.(transaction.id);
    setDeleteOpen(false);
    setPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-accent/50 transition-colors duration-150 group">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 relative ${
        isIncome ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
      }`}>
        <Icon className="w-4.5 h-4.5" />
        {/* Recurring badge */}
        {transaction.isRecurring && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
            <RefreshCw className="w-2.5 h-2.5 text-gold" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-foreground truncate">
            {transaction.description}
          </p>
          {transaction.isRecurring && (
            <span className="px-1 py-0.5 bg-gold/10 text-gold text-[8px] font-semibold rounded uppercase tracking-wider shrink-0">
              Recurring
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {transaction.category} · {formattedDate}
        </p>
      </div>

      {/* Amount */}
      <span className={`font-mono text-sm font-medium shrink-0 ${
        isIncome ? 'text-success' : 'text-foreground'
      }`}>
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </span>

      {/* Actions Menu */}
      {(onMakeRecurring || onDelete) && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-foreground transition-all duration-150 rounded-md hover:bg-accent">
              <MoreVertical className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-48 p-1.5 bg-card border-border"
          >
            {!transaction.isRecurring && onMakeRecurring && (
              <>
                <p className="px-2 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Make Recurring
                </p>
                {frequencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleMakeRecurring(opt.value)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors duration-100"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-gold" />
                    {opt.label}
                  </button>
                ))}
              </>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  setPopoverOpen(false);
                  setDeleteOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-danger hover:bg-danger/10 rounded-md transition-colors duration-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </PopoverContent>
        </Popover>
      )}

      {/* Delete Confirmation */}
      {onDelete && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{transaction.description}" and adjust your balance accordingly. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
