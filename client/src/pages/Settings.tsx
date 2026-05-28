/**
 * Settings Page
 * Design: Vault luxury fintech — navy background, gold accents, frosted glass cards
 * Features: Update starting balance, reset all data, re-trigger onboarding, app info
 */
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/finance-store';
import {
  ArrowLeft,
  Wallet,
  RotateCcw,
  BookOpen,
  Info,
  Shield,
  Database,
  ChevronRight,
  AlertTriangle,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Settings() {
  const { balance, transactions, recurringTransactions, snapshots, updateBalance, reset } = useFinanceContext();
  const [, navigate] = useLocation();
  const [editingBalance, setEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState(balance.toString());
  const [balanceSaved, setBalanceSaved] = useState(false);

  const handleUpdateBalance = () => {
    const parsed = parseFloat(newBalance.replace(/[^0-9.-]/g, ''));
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Please enter a valid positive number');
      return;
    }
    updateBalance(parsed);
    setEditingBalance(false);
    setBalanceSaved(true);
    toast.success(`Balance updated to ${formatCurrency(parsed)}`);
    setTimeout(() => setBalanceSaved(false), 2000);
  };

  const handleResetAll = () => {
    reset();
    // Force reload to trigger onboarding
    window.location.href = '/';
  };

  const handleRetriggerOnboarding = () => {
    reset();
    window.location.href = '/';
  };

  // Data stats
  const totalTransactions = transactions.length;
  const totalRecurring = recurringTransactions.length;
  const totalSnapshots = snapshots.length;
  const storageUsed = (() => {
    try {
      const data = localStorage.getItem('financeflow_data_v2') || '';
      const history = localStorage.getItem('financeflow_history_v1') || '';
      const bytes = new Blob([data, history]).size;
      if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${bytes} B`;
    } catch {
      return 'Unknown';
    }
  })();

  return (
    <div className="pb-24 safe-top">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and data</p>
      </header>

      {/* Balance Section */}
      <section className="px-4 mt-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Current Balance</h3>
              <p className="text-xs text-muted-foreground">Adjust your account balance</p>
            </div>
          </div>

          {!editingBalance ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-2xl font-bold text-foreground">{formatCurrency(balance)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total across all accounts</p>
              </div>
              <button
                onClick={() => {
                  setNewBalance(balance.toString());
                  setEditingBalance(true);
                }}
                className="px-4 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-all active:scale-[0.97]"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold font-semibold">$</span>
                <input
                  type="text"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full pl-8 pr-4 py-3 rounded-lg bg-background/50 border border-gold/30 text-foreground font-mono text-lg focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all"
                  autoFocus
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingBalance(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-muted/20 transition-all active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBalance}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gold text-navy text-sm font-bold hover:bg-gold/90 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
                >
                  {balanceSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  Save Balance
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Data & Storage */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Data & Storage</h2>
        <div className="glass-card divide-y divide-border/50">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Transactions</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{totalTransactions}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Recurring Rules</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{totalRecurring}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Monthly Snapshots</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{totalSnapshots}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Storage Used</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{storageUsed}</span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Actions</h2>
        <div className="space-y-3">
          {/* Re-trigger Onboarding */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full glass-card p-4 flex items-center justify-between hover:border-gold/30 transition-all active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Restart Onboarding</p>
                    <p className="text-xs text-muted-foreground">Re-run the setup wizard from scratch</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Restart Onboarding?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will reset all your data and take you back to the initial setup wizard where you can set a new starting balance. All transactions, recurring rules, budgets, and history will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground hover:bg-muted/20">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRetriggerOnboarding}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Restart Setup
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reset All Data */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full glass-card p-4 flex items-center justify-between border-destructive/20 hover:border-destructive/40 transition-all active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-destructive">Reset All Data</p>
                    <p className="text-xs text-muted-foreground">Delete everything and start fresh</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Reset All Data?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  <span className="block mb-2">This action cannot be undone. The following will be permanently deleted:</span>
                  <span className="block text-sm space-y-1">
                    <span className="block">• {totalTransactions} transactions</span>
                    <span className="block">• {totalRecurring} recurring rules</span>
                    <span className="block">• {totalSnapshots} monthly snapshots</span>
                    <span className="block">• All budget allocations</span>
                    <span className="block">• Complete forecast history</span>
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground hover:bg-muted/20">Keep My Data</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* App Info */}
      <section className="px-4 mt-6 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">About</h2>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">FinanceFlow</h3>
              <p className="text-xs text-muted-foreground">Version 1.0.0 · PWA</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A personal finance forecasting dashboard with budgeting, transaction tracking, and 12-month cash flow projections. Built as a Progressive Web App for offline-first performance.
          </p>
          <div className="mt-3 pt-3 border-t border-border/50 flex gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gold/10 text-gold border border-gold/20">React 19</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gold/10 text-gold border border-gold/20">Tailwind 4</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gold/10 text-gold border border-gold/20">TypeScript</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gold/10 text-gold border border-gold/20">PWA</span>
          </div>
        </div>
      </section>
    </div>
  );
}
