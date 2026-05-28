/**
 * OnboardingCarousel - Required first-run initialization flow
 * 
 * Shows a 3-step carousel that introduces the app features,
 * then requires the user to enter a starting balance before accessing the dashboard.
 * Once completed, it never shows again.
 * 
 * Vault Design: Frosted glass overlay with gold accents, smooth transitions
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, RefreshCw, TrendingUp, 
  ChevronRight, ChevronLeft, Sparkles, DollarSign, Wallet
} from 'lucide-react';
import { useFinanceContext } from '@/contexts/FinanceContext';

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}

const steps: OnboardingStep[] = [
  {
    icon: LayoutDashboard,
    title: 'Track Everything',
    description: 'Monitor your income, expenses, and savings rate at a glance. Add transactions with a single tap and watch your budget update in real time.',
    accent: 'from-gold/20 to-gold/5',
  },
  {
    icon: RefreshCw,
    title: 'Automate Recurring',
    description: 'Mark bills and income as recurring — they auto-populate in future months and feed directly into your financial forecast.',
    accent: 'from-chart-2/20 to-chart-2/5',
  },
  {
    icon: TrendingUp,
    title: 'Forecast Your Future',
    description: 'See a 12-month projection of your finances based on real spending patterns. Make smarter decisions with data-driven insights.',
    accent: 'from-success/20 to-success/5',
  },
];

interface OnboardingCarouselProps {
  onComplete: () => void;
}

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const { initialize } = useFinanceContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [balanceInput, setBalanceInput] = useState('');
  const [showBalanceStep, setShowBalanceStep] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = useCallback(() => {
    const balance = parseFloat(balanceInput.replace(/[^0-9.-]/g, ''));
    
    if (isNaN(balance) || balanceInput.trim() === '') {
      setError('Please enter a valid starting balance');
      return;
    }

    if (balance < 0) {
      setError('Starting balance cannot be negative');
      return;
    }

    // Initialize the app with the starting balance
    initialize(balance);
    onComplete();
  }, [balanceInput, initialize, onComplete]);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      // Move to balance input step
      setDirection(1);
      setShowBalanceStep(true);
    }
  }, [currentStep]);

  const prev = useCallback(() => {
    if (showBalanceStep) {
      setShowBalanceStep(false);
      setDirection(-1);
    } else if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, showBalanceStep]);

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow digits, decimal point, and commas
    if (/^[\d,]*\.?\d*$/.test(value) || value === '') {
      setBalanceInput(value);
      setError('');
    }
  };

  const formatPreview = () => {
    const num = parseFloat(balanceInput.replace(/[^0-9.-]/g, ''));
    if (isNaN(num) || balanceInput.trim() === '') return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  const totalSteps = steps.length + 1; // +1 for balance step
  const activeStepIndex = showBalanceStep ? steps.length : currentStep;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
    >
      {/* Backdrop - no dismiss on click since this is required */}
      <div className="absolute inset-0 bg-navy-dark/90 backdrop-blur-md" />

      {/* Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-navy/95 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* Balance Input Step */}
        {showBalanceStep ? (
          <motion.div
            key="balance-step"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="h-40 bg-gradient-to-b from-gold/20 to-gold/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 left-8 w-16 h-16 rounded-full bg-gold/5 blur-xl" />
              <div className="absolute bottom-2 right-12 w-20 h-20 rounded-full bg-gold/5 blur-xl" />
              <div className="w-16 h-16 rounded-2xl bg-navy/60 border border-gold/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-8 h-8 text-gold" />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-5 pb-6">
              <h2 className="font-display text-xl text-foreground text-center">
                Set Your Starting Balance
              </h2>
              <p className="text-sm text-muted-foreground text-center leading-relaxed mt-2">
                Enter your current total balance across all accounts. This is the foundation for your financial forecast.
              </p>

              {/* Balance Input */}
              <div className="mt-5 relative">
                <div className="flex items-center gap-2 p-4 rounded-xl border border-gold/20 bg-navy-dark/50 focus-within:border-gold/50 transition-colors">
                  <DollarSign className="w-5 h-5 text-gold shrink-0" />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={balanceInput}
                    onChange={handleBalanceChange}
                    placeholder="0.00"
                    autoFocus
                    className="flex-1 bg-transparent text-xl font-mono text-foreground placeholder:text-muted-foreground/40 outline-none"
                  />
                </div>
                
                {/* Preview */}
                {formatPreview() && (
                  <p className="text-xs text-gold/70 mt-2 text-center font-mono">
                    {formatPreview()}
                  </p>
                )}

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-400 mt-2 text-center">
                    {error}
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                {[1000, 5000, 10000, 25000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => { setBalanceInput(amount.toString()); setError(''); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:border-gold/30 transition-all duration-150 active:scale-95"
                  >
                    ${(amount / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-5">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeStepIndex
                        ? 'w-6 bg-gold'
                        : index < activeStepIndex
                        ? 'w-1.5 bg-gold/40'
                        : 'w-1.5 bg-white/15'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={prev}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-150 active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gold text-navy-dark text-xs font-semibold hover:bg-gold-light active:scale-[0.97] transition-all duration-160"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Launch FinanceFlow
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Feature Steps */}
            <div className={`h-40 bg-gradient-to-b ${steps[currentStep].accent} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute top-4 left-8 w-16 h-16 rounded-full bg-gold/5 blur-xl" />
              <div className="absolute bottom-2 right-12 w-20 h-20 rounded-full bg-gold/5 blur-xl" />
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="w-16 h-16 rounded-2xl bg-navy/60 border border-gold/20 backdrop-blur-sm flex items-center justify-center"
                >
                  {(() => {
                    const Icon = steps[currentStep].icon;
                    return <Icon className="w-8 h-8 text-gold" />;
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="px-6 pt-5 pb-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <h2 className="font-display text-xl text-foreground text-center">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed mt-2.5">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-5">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeStepIndex
                        ? 'w-6 bg-gold'
                        : index < activeStepIndex
                        ? 'w-1.5 bg-gold/40'
                        : 'w-1.5 bg-white/15'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={prev}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
                    currentStep === 0
                      ? 'text-muted-foreground/30 cursor-not-allowed'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <button
                  onClick={next}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gold text-navy-dark text-xs font-semibold hover:bg-gold-light active:scale-[0.97] transition-all duration-160"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
