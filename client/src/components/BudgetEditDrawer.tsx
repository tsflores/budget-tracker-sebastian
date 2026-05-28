/**
 * BudgetEditDrawer - Tap a category to adjust its monthly allocation
 * Shows a slider + input with real-time forecast impact preview
 * Vault Design: Frosted glass drawer, gold accent on active controls
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/finance-store';
import { Slider } from '@/components/ui/slider';
import { 
  X, TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle 
} from 'lucide-react';

interface BudgetEditDrawerProps {
  categoryId: string | null;
  onClose: () => void;
}

export function BudgetEditDrawer({ categoryId, onClose }: BudgetEditDrawerProps) {
  const { budgetCategories, editBudgetAllocation, forecast, balance } = useFinanceContext();
  
  const category = useMemo(
    () => budgetCategories.find(c => c.id === categoryId),
    [budgetCategories, categoryId]
  );

  const [localAllocated, setLocalAllocated] = useState(0);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (category) {
      setLocalAllocated(category.allocated);
      setHasChanged(false);
    }
  }, [category]);

  // Calculate forecast impact preview
  const forecastImpact = useMemo(() => {
    if (!category) return null;
    
    const diff = localAllocated - category.allocated;
    const totalBudget = budgetCategories.reduce((sum, c) => sum + c.allocated, 0);
    const newTotalBudget = totalBudget + diff;
    
    // Simple projection: 12-month impact
    const monthlyImpact = diff; // positive = more spending allowed, negative = less
    const yearlyImpact = monthlyImpact * 12;
    
    // Current end-of-year balance from forecast
    const currentEndBalance = forecast[forecast.length - 1]?.cumulativeBalance || balance;
    // Projected new end balance (less spending = more savings)
    const projectedEndBalance = currentEndBalance - yearlyImpact;
    
    return {
      diff,
      monthlyImpact,
      yearlyImpact,
      currentEndBalance,
      projectedEndBalance,
      newTotalBudget,
      isIncrease: diff > 0,
    };
  }, [localAllocated, category, budgetCategories, forecast, balance]);

  const handleSave = () => {
    if (category && hasChanged) {
      editBudgetAllocation(category.id, localAllocated);
    }
    onClose();
  };

  const handleSliderChange = (value: number[]) => {
    setLocalAllocated(value[0]);
    setHasChanged(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setLocalAllocated(Math.max(0, Math.min(val, 15000)));
    setHasChanged(true);
  };

  // Preset quick-adjust buttons
  const presets = useMemo(() => {
    if (!category) return [];
    const base = category.allocated;
    return [
      { label: '-25%', value: Math.round(base * 0.75) },
      { label: '-10%', value: Math.round(base * 0.90) },
      { label: 'Reset', value: base },
      { label: '+10%', value: Math.round(base * 1.10) },
      { label: '+25%', value: Math.round(base * 1.25) },
    ];
  }, [category]);

  if (!category) return null;

  const percentage = localAllocated > 0 ? (category.spent / localAllocated) * 100 : 0;
  const isOverBudget = percentage > 100;
  const remaining = localAllocated - category.spent;

  return (
    <AnimatePresence>
      {categoryId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-navy-dark/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[60] max-w-lg mx-auto"
          >
            <div className="bg-navy border-t border-white/10 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="px-5 pt-2 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg text-foreground">Edit Budget</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{category.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Status */}
              <div className="px-5 pb-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Month Status</span>
                    {isOverBudget && (
                      <span className="flex items-center gap-1 text-xs text-danger">
                        <AlertTriangle className="w-3 h-3" />
                        Over budget
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: isOverBudget ? '#e05252' : category.color }}
                      initial={false}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Spent: {formatCurrency(category.spent)}
                    </span>
                    <span className={`text-xs font-mono ${isOverBudget ? 'text-danger' : 'text-success'}`}>
                      {isOverBudget ? `Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} left`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Allocation Editor */}
              <div className="px-5 pb-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
                  Monthly Allocation
                </label>
                
                {/* Amount input */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    <input
                      type="number"
                      value={localAllocated}
                      onChange={handleInputChange}
                      min={0}
                      max={15000}
                      className="w-full pl-9 pr-4 py-3 bg-muted/50 border border-white/10 rounded-xl text-foreground font-mono text-lg focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">/month</span>
                </div>

                {/* Slider */}
                <div className="px-1 mb-4">
                  <Slider
                    value={[localAllocated]}
                    onValueChange={handleSliderChange}
                    min={0}
                    max={Math.max(category.allocated * 3, 5000)}
                    step={25}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">$0</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatCurrency(Math.max(category.allocated * 3, 5000))}
                    </span>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => { setLocalAllocated(preset.value); setHasChanged(true); }}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                        localAllocated === preset.value
                          ? 'bg-gold/20 text-gold border border-gold/30'
                          : 'bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forecast Impact Preview */}
              {forecastImpact && hasChanged && forecastImpact.diff !== 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="px-5 pb-4"
                >
                  <div className="glass-card p-4 border border-gold/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs font-medium text-gold uppercase tracking-wider">
                        Forecast Impact
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Monthly Change</p>
                        <p className={`text-sm font-mono ${forecastImpact.isIncrease ? 'text-danger' : 'text-success'}`}>
                          {forecastImpact.isIncrease ? '+' : ''}{formatCurrency(forecastImpact.monthlyImpact)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">12-Month Impact</p>
                        <p className={`text-sm font-mono ${forecastImpact.isIncrease ? 'text-danger' : 'text-success'}`}>
                          {forecastImpact.isIncrease ? '+' : ''}{formatCurrency(forecastImpact.yearlyImpact)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">New Total Budget</p>
                        <p className="text-sm font-mono text-foreground">
                          {formatCurrency(forecastImpact.newTotalBudget)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Projected Balance</p>
                        <div className="flex items-center gap-1">
                          {forecastImpact.isIncrease ? (
                            <TrendingDown className="w-3 h-3 text-danger" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-success" />
                          )}
                          <p className={`text-sm font-mono ${forecastImpact.isIncrease ? 'text-danger' : 'text-success'}`}>
                            {formatCurrency(forecastImpact.projectedEndBalance)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                      {forecastImpact.isIncrease 
                        ? `Increasing this budget by ${formatCurrency(Math.abs(forecastImpact.diff))}/mo will reduce your projected year-end balance.`
                        : `Reducing this budget by ${formatCurrency(Math.abs(forecastImpact.diff))}/mo will increase your projected year-end balance.`
                      }
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="px-5 pb-6 pt-2 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground font-medium hover:bg-white/10 transition-all active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanged}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                    hasChanged
                      ? 'bg-gold text-navy-dark hover:bg-gold-light'
                      : 'bg-gold/20 text-gold/40 cursor-not-allowed'
                  }`}
                >
                  Save & Update Forecast
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
