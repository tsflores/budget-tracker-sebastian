/**
 * About / Getting Started Page - Onboarding orientation for new users
 * Vault Design: Elegant walkthrough with feature cards, gold accents
 */
import { Link } from 'wouter';
import { 
  LayoutDashboard, Wallet, ArrowLeftRight, RefreshCw, TrendingUp,
  Plus, Shield, Smartphone, Zap, ChevronRight, Sparkles, Target,
  PiggyBank, BarChart3, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard Overview',
    description: 'See your total balance, income vs. expenses, savings rate, and a 6-month outlook chart — all at a glance.',
    link: '/',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    icon: Wallet,
    title: 'Budget Tracking',
    description: 'Set monthly budgets by category and track your spending with visual progress rings. Stay on target effortlessly.',
    link: '/budget',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  {
    icon: ArrowLeftRight,
    title: 'Transaction History',
    description: 'Log income and expenses, search and filter your history, and see exactly where your money goes.',
    link: '/transactions',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: RefreshCw,
    title: 'Recurring Transactions',
    description: 'Mark bills and income as recurring — they auto-populate in future months and feed directly into your forecast.',
    link: '/recurring',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    icon: TrendingUp,
    title: '12-Month Forecast',
    description: 'Project your financial future with balance trends, cash flow analysis, and monthly breakdowns based on your real data.',
    link: '/forecast',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
];

const quickTips = [
  {
    icon: Plus,
    tip: 'Tap the gold + button to add a transaction from any screen.',
  },
  {
    icon: RefreshCw,
    tip: 'Toggle "Make Recurring" when adding a transaction to auto-populate it monthly.',
  },
  {
    icon: Target,
    tip: 'Check the Forecast page to see how today\'s habits shape your 12-month outlook.',
  },
  {
    icon: Smartphone,
    tip: 'Install FinanceFlow to your home screen for instant access — it works offline too.',
  },
];

export default function About() {
  return (
    <div className="pb-24 safe-top">
      {/* Header with back navigation */}
      <header className="px-4 pt-4 pb-2">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-foreground">Welcome to FinanceFlow</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your personal finance command center</p>
          </div>
        </div>
      </header>

      {/* Hero Introduction */}
      <section className="px-4 mt-5">
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="font-display text-lg text-foreground mb-2">Take Control of Your Finances</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FinanceFlow helps you track spending, manage budgets, set up recurring transactions, 
              and forecast your financial future — all in one beautiful, mobile-first app.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Private & Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-gold" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Works Offline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Walkthrough */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Explore Features</h2>
        <p className="text-xs text-muted-foreground mb-4">Tap any feature to jump directly to it</p>
        
        <div className="space-y-3 stagger-enter">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.link}>
                <div className="glass-card p-4 flex items-start gap-3.5 group hover:border-gold/20 transition-all duration-200 cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono">{String(index + 1).padStart(2, '0')}</span>
                      <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors shrink-0 mt-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Tips */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">Quick Tips</h2>
        <p className="text-xs text-muted-foreground mb-4">Get the most out of FinanceFlow</p>
        
        <div className="glass-card p-4 space-y-4">
          {quickTips.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-gold" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How Forecasting Works */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-1">How Forecasting Works</h2>
        <p className="text-xs text-muted-foreground mb-4">Understand your 12-month projection</p>
        
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] text-gold font-bold">1</span>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Baseline Income & Expenses</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">We use your current monthly averages as the starting point.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] text-gold font-bold">2</span>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Recurring Transactions</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">All active recurring items are automatically included in each future month.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] text-gold font-bold">3</span>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Seasonal Variation</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">A small randomized variance simulates real-world spending fluctuations.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] text-gold font-bold">4</span>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Cumulative Balance</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Each month's net cash flow compounds on your current balance to show growth over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Info */}
      <section className="px-4 mt-6 mb-4">
        <div className="glass-card p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-gold" />
          </div>
          <h3 className="font-display text-lg text-foreground">FinanceFlow</h3>
          <p className="text-xs text-muted-foreground mt-1">Personal Finance Dashboard</p>
          <p className="text-[10px] text-muted-foreground mt-3">Version 1.1.0 · Progressive Web App</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-medium rounded-full uppercase tracking-wider">React</span>
            <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-medium rounded-full uppercase tracking-wider">Tailwind</span>
            <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-medium rounded-full uppercase tracking-wider">PWA</span>
          </div>
          <div className="mt-4">
            <Link href="/">
              <Button className="bg-gold text-navy-dark font-semibold hover:bg-gold-light active:scale-[0.98] transition-all duration-160">
                <PiggyBank className="w-4 h-4 mr-2" />
                Start Managing Finances
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
