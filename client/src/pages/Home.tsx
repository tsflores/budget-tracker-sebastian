/**
 * Dashboard Page - Main overview
 * Vault Design: Navy background, gold-accented metrics, glass cards
 * Hero section with abstract financial visualization
 * 
 * Trends are now derived from monthly history snapshots (history-store)
 * rather than hardcoded percentages.
 */
import { MetricCard } from '@/components/MetricCard';
import { TransactionItem } from '@/components/TransactionItem';
import { BudgetRing } from '@/components/BudgetRing';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/finance-store';
import { Wallet, TrendingUp, PiggyBank, ArrowDownUp, RefreshCw, Settings } from 'lucide-react';
import { Link } from 'wouter';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

export default function Home() {
  const { 
    balance, monthlyIncome, monthlyExpenses, savingsRate, 
    transactions, budgetCategories, forecast, recurringTransactions,
    getTrend, previousMonth 
  } = useFinanceContext();

  // Real trend calculations from history
  const incomeTrend = getTrend(monthlyIncome, 'income');
  const expenseTrend = getTrend(monthlyExpenses, 'expenses');
  const balanceTrend = getTrend(balance, 'balance');

  // Mini forecast chart data (next 6 months)
  const chartData = forecast.slice(0, 6).map(f => ({
    name: f.month.split(' ')[0],
    balance: f.cumulativeBalance,
  }));

  // Top 4 budget categories by spend
  const topBudgets = [...budgetCategories]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  return (
    <div className="pb-24 safe-top">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Welcome back</p>
          <h1 className="font-display text-2xl text-foreground mt-0.5">FinanceFlow</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/history" className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center hover:border-gold/40 transition-colors" title="View Trends">
            <TrendingUp className="w-4 h-4 text-gold" />
          </Link>
          <Link href="/about" className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center hover:border-gold/40 transition-colors" title="About FinanceFlow">
            <span className="text-gold font-semibold text-sm">?</span>
          </Link>
          <Link href="/settings" className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center hover:border-gold/40 transition-colors" title="Settings">
            <Settings className="w-4 h-4 text-gold" />
          </Link>
        </div>
      </header>

      {/* Hero Balance Card */}
      <section className="px-4 mt-4">
        <div className="glass-card p-5 relative overflow-hidden gold-glow">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663183403549/aAaiETBequFcyb2jW9Meb6/card-pattern-gold-Ykp5DxHGdQmxX5R3hbsjCr.webp)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative">
            <p className="text-xs text-gold-light uppercase tracking-widest font-medium">Total Balance</p>
            <p className="font-display text-4xl sm:text-5xl text-foreground mt-2 animate-count">
              {formatCurrency(balance)}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Income: <span className="text-foreground font-mono">{formatCurrency(monthlyIncome)}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-xs text-muted-foreground">Expenses: <span className="text-foreground font-mono">{formatCurrency(monthlyExpenses)}</span></span>
              </div>
            </div>
            {/* Previous month context */}
            {previousMonth && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[10px] text-muted-foreground">
                  Last month: Income {formatCurrency(previousMonth.income)} · Expenses {formatCurrency(previousMonth.expenses)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="px-4 mt-5 grid grid-cols-2 gap-3 stagger-enter">
        <MetricCard
          title="Income"
          value={formatCurrency(monthlyIncome)}
          trend={incomeTrend.available ? incomeTrend.direction : undefined}
          trendValue={incomeTrend.available ? incomeTrend.value : undefined}
          icon={<TrendingUp className="w-4.5 h-4.5" />}
        />
        <MetricCard
          title="Expenses"
          value={formatCurrency(monthlyExpenses)}
          trend={expenseTrend.available ? expenseTrend.direction : undefined}
          trendValue={expenseTrend.available ? expenseTrend.value : undefined}
          icon={<ArrowDownUp className="w-4.5 h-4.5" />}
          invertSemantic
        />
        <MetricCard
          title="Savings"
          value={`${savingsRate}%`}
          subtitle="of income saved"
          icon={<PiggyBank className="w-4.5 h-4.5" />}
        />
        <MetricCard
          title="Net Worth"
          value={formatCurrency(balance)}
          trend={balanceTrend.available ? balanceTrend.direction : undefined}
          trendValue={balanceTrend.available ? balanceTrend.value : undefined}
          icon={<Wallet className="w-4.5 h-4.5" />}
        />
      </section>

      {/* Mini Forecast Chart */}
      <section className="px-4 mt-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">6-Month Outlook</h2>
            <Link href="/forecast" className="text-xs text-gold hover:text-gold-light transition-colors">
              View Full →
            </Link>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B5A167" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#B5A167" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8a8a9a', fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(0.22 0.04 250 / 0.95)',
                    border: '1px solid oklch(0.73 0.08 85 / 0.2)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                  }}
                  labelStyle={{ color: '#B5A167', fontSize: 11 }}
                  itemStyle={{ color: '#e8e8e8', fontSize: 12 }}
                  formatter={(value: number) => [formatCurrency(value), 'Balance']}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#B5A167"
                  strokeWidth={2}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Budget Overview */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Budget Status</h2>
          <Link href="/budget" className="text-xs text-gold hover:text-gold-light transition-colors">
            Manage →
          </Link>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-around">
            {topBudgets.map((cat) => (
              <BudgetRing
                key={cat.id}
                percentage={cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0}
                size={64}
                strokeWidth={5}
                color={cat.color}
                label={cat.name.split(' ')[0]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Recurring */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Upcoming Recurring</h2>
          <Link href="/recurring" className="text-xs text-gold hover:text-gold-light transition-colors">
            Manage →
          </Link>
        </div>
        <div className="glass-card p-3 space-y-2">
          {recurringTransactions
            .filter(r => r.isActive)
            .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
            .slice(0, 3)
            .map((rt) => (
              <div key={rt.id} className="flex items-center gap-3 py-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rt.type === 'income' ? 'bg-success/10' : 'bg-gold/10'}`}>
                  <RefreshCw className={`w-3.5 h-3.5 ${rt.type === 'income' ? 'text-success' : 'text-gold'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{rt.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Due {new Date(rt.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`font-mono text-xs font-medium ${rt.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                  {rt.type === 'income' ? '+' : '-'}{formatCurrency(rt.amount)}
                </span>
              </div>
            ))}
          {recurringTransactions.filter(r => r.isActive).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No recurring transactions set up</p>
          )}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <Link href="/transactions" className="text-xs text-gold hover:text-gold-light transition-colors">
            View All →
          </Link>
        </div>
        <div className="glass-card p-2">
          {transactions.slice(0, 5).map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      </section>
    </div>
  );
}
