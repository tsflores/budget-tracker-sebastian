/**
 * Budget Page - Category-based budget management with custom category CRUD
 * Vault Design: Glass cards with progress bars, gold accents for active categories
 * Tap any category to edit its allocation; long-press or use menu to edit/delete
 */
import { useState } from 'react';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/finance-store';
import { BudgetRing } from '@/components/BudgetRing';
import { BudgetEditDrawer } from '@/components/BudgetEditDrawer';
import { CategoryManageDrawer, resolveIcon } from '@/components/CategoryManageDrawer';
import { Plus, Pencil, MoreVertical, Settings2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Budget() {
  const { budgetCategories, monthlyExpenses, monthlyIncome } = useFinanceContext();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [manageMode, setManageMode] = useState<'add' | 'edit' | null>(null);
  const [manageCategoryId, setManageCategoryId] = useState<string | null>(null);

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const overallPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  const remaining = totalAllocated - totalSpent;

  const handleEditDetails = (categoryId: string) => {
    setManageCategoryId(categoryId);
    setManageMode('edit');
  };

  return (
    <div className="pb-24 safe-top">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Budget</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · {budgetCategories.length} categories
          </p>
        </div>
        <button
          onClick={() => setManageMode('add')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-xs font-medium hover:bg-gold/20 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </header>

      {/* Overall Budget Ring */}
      <section className="px-4 mt-4">
        <div className="glass-card p-6 flex items-center gap-6">
          <BudgetRing
            percentage={overallPercentage}
            size={100}
            strokeWidth={8}
            color="#B5A167"
          />
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</p>
              <p className="font-display text-2xl text-foreground">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
              <p className="font-mono text-lg text-success">{formatCurrency(remaining)}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(totalAllocated)} budgeted
            </p>
          </div>
        </div>
      </section>

      {/* Income vs Expenses Summary */}
      <section className="px-4 mt-5">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Income vs Expenses</span>
            <span className="text-xs font-mono text-gold">{monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0}% used</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-700"
              style={{ 
                width: `${monthlyIncome > 0 ? Math.min((monthlyExpenses / monthlyIncome) * 100, 100) : 0}%`,
                transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)'
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">Spent: {formatCurrency(monthlyExpenses)}</span>
            <span className="text-xs text-muted-foreground">Income: {formatCurrency(monthlyIncome)}</span>
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Categories</h2>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Tap to adjust budget
          </span>
        </div>

        {budgetCategories.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">No categories yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first budget category to start tracking spending
            </p>
            <button
              onClick={() => setManageMode('add')}
              className="px-4 py-2 rounded-xl bg-gold text-navy-dark text-xs font-semibold hover:bg-gold-light transition-all active:scale-95"
            >
              Create Category
            </button>
          </div>
        ) : (
          <div className="space-y-3 stagger-enter">
            {budgetCategories.map((cat) => {
              const Icon = resolveIcon(cat.icon);
              const percentage = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
              const isOverBudget = percentage > 100;
              const catRemaining = cat.allocated - cat.spent;

              return (
                <div
                  key={cat.id}
                  className="glass-card p-4 w-full text-left group hover:border-gold/20 transition-all duration-200 relative"
                >
                  {/* Main tappable area for allocation editing */}
                  <button
                    onClick={() => setEditingCategoryId(cat.id)}
                    className="w-full text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors group-hover:scale-105"
                        style={{ backgroundColor: `${cat.color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between pr-8">
                          <span className="text-sm font-medium text-foreground">{cat.name}</span>
                          <span className={`text-xs font-mono ${isOverBudget ? 'text-danger' : 'text-muted-foreground'}`}>
                            {formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOverBudget ? '#e05252' : cat.color,
                          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)'
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round(percentage)}% used
                      </span>
                      <span className={`text-[10px] font-mono ${isOverBudget ? 'text-danger' : 'text-success'}`}>
                        {isOverBudget ? 'Over by ' + formatCurrency(Math.abs(catRemaining)) : formatCurrency(catRemaining) + ' left'}
                      </span>
                    </div>
                  </button>

                  {/* Category menu (edit details / delete) */}
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg bg-transparent hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-navy border-white/10">
                        <DropdownMenuItem
                          onClick={() => handleEditDetails(cat.id)}
                          className="text-xs gap-2 text-foreground focus:bg-white/10 focus:text-foreground"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => { setManageCategoryId(cat.id); setManageMode('edit'); }}
                          className="text-xs gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}

            {/* Add Category card */}
            <button
              onClick={() => setManageMode('add')}
              className="glass-card p-4 w-full flex items-center justify-center gap-2 border-dashed border-white/10 hover:border-gold/30 hover:bg-gold/5 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">Add Category</span>
            </button>
          </div>
        )}
      </section>

      {/* Budget Edit Drawer (allocation only) */}
      <BudgetEditDrawer
        categoryId={editingCategoryId}
        onClose={() => setEditingCategoryId(null)}
      />

      {/* Category Manage Drawer (add/edit/delete) */}
      <CategoryManageDrawer
        mode={manageMode}
        categoryId={manageCategoryId}
        onClose={() => { setManageMode(null); setManageCategoryId(null); }}
      />
    </div>
  );
}
