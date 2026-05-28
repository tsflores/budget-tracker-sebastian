/**
 * CategoryManageDrawer - Add, edit, or delete budget categories
 * Vault Design: Frosted glass drawer with icon/color picker, gold accents
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/finance-store';
import {
  X, Home, UtensilsCrossed, Car, Film, Zap, Heart, ShoppingBag,
  TrendingUp, Briefcase, GraduationCap, Plane, Gift, Coffee,
  Smartphone, Wifi, Dumbbell, PawPrint, Baby, Palette, Music,
  BookOpen, Scissors, Wrench, DollarSign, Trash2, AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

// Available icons for categories
const AVAILABLE_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Home', icon: Home },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Car', icon: Car },
  { name: 'Film', icon: Film },
  { name: 'Zap', icon: Zap },
  { name: 'Heart', icon: Heart },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Plane', icon: Plane },
  { name: 'Gift', icon: Gift },
  { name: 'Coffee', icon: Coffee },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Wifi', icon: Wifi },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'PawPrint', icon: PawPrint },
  { name: 'Baby', icon: Baby },
  { name: 'Palette', icon: Palette },
  { name: 'Music', icon: Music },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Scissors', icon: Scissors },
  { name: 'Wrench', icon: Wrench },
  { name: 'DollarSign', icon: DollarSign },
];

// Available colors for categories
const AVAILABLE_COLORS = [
  '#B5A167', // Gold
  '#4A90D9', // Blue
  '#6B8E9B', // Teal
  '#8B7355', // Brown
  '#5C7A8A', // Steel
  '#7A9B6B', // Green
  '#9B7A8B', // Mauve
  '#D4845C', // Coral
  '#6B5B95', // Purple
  '#88B04B', // Lime
  '#F7CAC9', // Pink
  '#92A8D1', // Periwinkle
];

// Export the icon resolver so other components can use it
export function resolveIcon(iconName: string): LucideIcon {
  const found = AVAILABLE_ICONS.find(i => i.name === iconName);
  return found?.icon || Home;
}

interface CategoryManageDrawerProps {
  mode: 'add' | 'edit' | null;
  categoryId?: string | null;
  onClose: () => void;
}

export function CategoryManageDrawer({ mode, categoryId, onClose }: CategoryManageDrawerProps) {
  const { budgetCategories, addCategory, editCategory, removeCategory } = useFinanceContext();

  const existingCategory = categoryId
    ? budgetCategories.find(c => c.id === categoryId)
    : null;

  const [name, setName] = useState('');
  const [allocated, setAllocated] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState('Home');
  const [selectedColor, setSelectedColor] = useState('#B5A167');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && existingCategory) {
      setName(existingCategory.name);
      setAllocated(existingCategory.allocated);
      setSelectedIcon(existingCategory.icon);
      setSelectedColor(existingCategory.color);
    } else if (mode === 'add') {
      setName('');
      setAllocated(0);
      setSelectedIcon('Home');
      setSelectedColor(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
    }
    setShowDeleteConfirm(false);
  }, [mode, existingCategory]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    // Check for duplicate names (excluding current category in edit mode)
    const duplicate = budgetCategories.find(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== categoryId
    );
    if (duplicate) {
      toast.error('A category with this name already exists');
      return;
    }

    if (mode === 'add') {
      addCategory({
        name: name.trim(),
        allocated,
        color: selectedColor,
        icon: selectedIcon,
      });
      toast.success(`"${name.trim()}" category added`);
    } else if (mode === 'edit' && categoryId) {
      editCategory(categoryId, {
        name: name.trim(),
        allocated,
        color: selectedColor,
        icon: selectedIcon,
      });
      toast.success(`"${name.trim()}" category updated`);
    }

    onClose();
  };

  const handleDelete = () => {
    if (categoryId) {
      removeCategory(categoryId);
      toast.success(`Category deleted`);
      onClose();
    }
  };

  const isOpen = mode !== null;

  return (
    <AnimatePresence>
      {isOpen && (
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
                  <h2 className="font-display text-lg text-foreground">
                    {mode === 'add' ? 'New Category' : 'Edit Category'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mode === 'add' ? 'Create a custom budget category' : 'Modify category details'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview */}
              <div className="px-5 pb-4">
                <div className="glass-card p-4 flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${selectedColor}20` }}
                  >
                    {(() => {
                      const Icon = resolveIcon(selectedIcon);
                      return <Icon className="w-5 h-5" style={{ color: selectedColor }} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {name || 'Category Name'}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatCurrency(allocated)} /month
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="px-5 pb-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Groceries, Gym, Subscriptions..."
                  maxLength={30}
                  className="w-full px-4 py-3 bg-muted/50 border border-white/10 rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
                />
              </div>

              {/* Monthly Allocation */}
              <div className="px-5 pb-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                  Monthly Allocation
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                  <input
                    type="number"
                    value={allocated || ''}
                    onChange={(e) => setAllocated(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    min={0}
                    max={50000}
                    className="w-full pl-9 pr-4 py-3 bg-muted/50 border border-white/10 rounded-xl text-foreground font-mono text-lg focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
                  />
                </div>
                {/* Quick amount buttons */}
                <div className="flex gap-2 mt-2">
                  {[100, 250, 500, 1000, 2000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setAllocated(amount)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all active:scale-95 ${
                        allocated === amount
                          ? 'bg-gold/20 text-gold border border-gold/30'
                          : 'bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      ${amount >= 1000 ? `${amount / 1000}k` : amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div className="px-5 pb-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map(({ name: iconName, icon: Icon }) => (
                    <button
                      key={iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                        selectedIcon === iconName
                          ? 'bg-gold/20 border border-gold/40 ring-1 ring-gold/20'
                          : 'bg-white/5 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: selectedIcon === iconName ? selectedColor : 'var(--muted-foreground)' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="px-5 pb-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all active:scale-90 ${
                        selectedColor === color
                          ? 'scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: color,
                        boxShadow: selectedColor === color ? `0 0 0 2px var(--color-background), 0 0 0 4px ${color}` : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Delete button (edit mode only) */}
              {mode === 'edit' && existingCategory && (
                <div className="px-5 pb-4">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-all active:scale-[0.97]"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Category
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card p-4 border border-red-500/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Delete "{existingCategory.name}"?</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        This will remove the category and its budget allocation. Existing transactions in this category will keep their category label but won't be tracked against a budget.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-red-400 font-medium hover:bg-red-500/30 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
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
                  className="flex-1 py-3 rounded-xl bg-gold text-navy-dark text-sm font-semibold hover:bg-gold-light transition-all active:scale-[0.97]"
                >
                  {mode === 'add' ? 'Add Category' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
