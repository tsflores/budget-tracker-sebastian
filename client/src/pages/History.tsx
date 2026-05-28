/**
 * History / Trends Page
 * Vault Design: Navy background, gold-accented charts, glass cards
 * 
 * Shows month-over-month trends for income, expenses, savings rate,
 * and category performance using stored monthly snapshots.
 */
import { useFinanceContext } from '@/contexts/FinanceContext';
import { formatCurrency, formatCompact } from '@/lib/finance-store';
import type { MonthlySnapshot } from '@/lib/history-store';
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend,
} from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ChartView = 'income-expenses' | 'savings' | 'categories' | 'balance';

export default function History() {
  const { snapshots, monthlyIncome, monthlyExpenses, savingsRate, balance } = useFinanceContext();
  const [activeView, setActiveView] = useState<ChartView>('income-expenses');

  // Sort snapshots chronologically (oldest first for charts)
  const sortedSnapshots = useMemo(() => {
    return [...snapshots].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [snapshots]);

  // Include current month as the latest data point
  const chartData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const data = sortedSnapshots.map(s => ({
      name: `${MONTH_NAMES[s.month]} ${s.year !== currentYear ? s.year : ''}`.trim(),
      month: MONTH_NAMES[s.month],
      income: s.income,
      expenses: s.expenses,
      savingsRate: s.savingsRate,
      balance: s.balance,
      net: s.income - s.expenses,
    }));

    // Add current month
    data.push({
      name: `${MONTH_NAMES[currentMonth]}*`,
      month: MONTH_NAMES[currentMonth],
      income: monthlyIncome,
      expenses: monthlyExpenses,
      savingsRate,
      balance,
      net: monthlyIncome - monthlyExpenses,
    });

    return data;
  }, [sortedSnapshots, monthlyIncome, monthlyExpenses, savingsRate, balance]);

  // Category trend data (last 4 months + current)
  const categoryData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const recentSnapshots = sortedSnapshots.slice(-4);

    // Get all unique category names
    const categoryNames = new Set<string>();
    recentSnapshots.forEach(s => s.categoryBreakdowns.forEach(c => categoryNames.add(c.name)));

    // Build data array for stacked bar chart
    return recentSnapshots.map(s => {
      const entry: Record<string, number | string> = {
        name: MONTH_NAMES[s.month],
      };
      s.categoryBreakdowns.forEach(c => {
        entry[c.name] = c.spent;
      });
      return entry;
    }).concat([{
      name: `${MONTH_NAMES[currentMonth]}*`,
      // We'd need current category data from context - use empty for now
      ...Object.fromEntries(Array.from(categoryNames).map(name => [name, 0])),
    }]);
  }, [sortedSnapshots]);

  // Get unique category names for the stacked chart
  const categoryNames = useMemo(() => {
    const names = new Set<string>();
    sortedSnapshots.forEach(s => s.categoryBreakdowns.forEach(c => names.add(c.name)));
    return Array.from(names);
  }, [sortedSnapshots]);

  // Category colors
  const categoryColors: Record<string, string> = {
    'Housing': '#B5A167',
    'Food & Dining': '#4A90D9',
    'Transportation': '#6B8E9B',
    'Entertainment': '#8B7355',
    'Utilities': '#5C7A8A',
    'Healthcare': '#7A9B6B',
    'Shopping': '#9B7A8B',
    'Savings & Investments': '#B5A167',
  };

  // Summary stats
  const stats = useMemo(() => {
    if (sortedSnapshots.length < 2) return null;

    const latest = sortedSnapshots[sortedSnapshots.length - 1];
    const oldest = sortedSnapshots[0];
    const avgIncome = sortedSnapshots.reduce((sum, s) => sum + s.income, 0) / sortedSnapshots.length;
    const avgExpenses = sortedSnapshots.reduce((sum, s) => sum + s.expenses, 0) / sortedSnapshots.length;
    const avgSavingsRate = sortedSnapshots.reduce((sum, s) => sum + s.savingsRate, 0) / sortedSnapshots.length;
    const balanceGrowth = latest.balance - oldest.balance;
    const balanceGrowthPct = oldest.balance > 0 ? ((latest.balance - oldest.balance) / oldest.balance) * 100 : 0;

    return {
      avgIncome: Math.round(avgIncome),
      avgExpenses: Math.round(avgExpenses),
      avgSavingsRate: Math.round(avgSavingsRate),
      balanceGrowth,
      balanceGrowthPct: balanceGrowthPct.toFixed(1),
      monthsTracked: sortedSnapshots.length,
      highestIncome: Math.max(...sortedSnapshots.map(s => s.income)),
      lowestExpenses: Math.min(...sortedSnapshots.map(s => s.expenses)),
    };
  }, [sortedSnapshots]);

  const tooltipStyle = {
    contentStyle: {
      background: 'oklch(0.22 0.04 250 / 0.95)',
      border: '1px solid oklch(0.73 0.08 85 / 0.2)',
      borderRadius: '8px',
      backdropFilter: 'blur(8px)',
      fontSize: '12px',
    },
    labelStyle: { color: '#B5A167', fontSize: 11, marginBottom: 4 },
    itemStyle: { color: '#e8e8e8', fontSize: 12 },
  };

  const views: { id: ChartView; label: string }[] = [
    { id: 'income-expenses', label: 'Income vs Expenses' },
    { id: 'savings', label: 'Savings Rate' },
    { id: 'balance', label: 'Balance Growth' },
    { id: 'categories', label: 'Categories' },
  ];

  return (
    <div className="pb-24 safe-top">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Link href="/" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="font-display text-2xl text-foreground">Trends</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sortedSnapshots.length} months of history · Updated monthly
          </p>
        </div>
      </header>

      {/* Summary Cards */}
      {stats && (
        <section className="px-4 mt-4 grid grid-cols-2 gap-3 stagger-enter">
          <div className="glass-card p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Income</p>
            <p className="font-display text-xl text-foreground mt-1">{formatCompact(stats.avgIncome)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">per month</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Expenses</p>
            <p className="font-display text-xl text-foreground mt-1">{formatCompact(stats.avgExpenses)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">per month</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Savings Rate</p>
            <p className="font-display text-xl text-gold mt-1">{stats.avgSavingsRate}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">of income</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance Growth</p>
            <p className={`font-display text-xl mt-1 ${stats.balanceGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
              {stats.balanceGrowth >= 0 ? '+' : ''}{formatCompact(stats.balanceGrowth)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{stats.balanceGrowthPct}% over {stats.monthsTracked} months</p>
          </div>
        </section>
      )}

      {/* Chart View Tabs */}
      <section className="px-4 mt-6">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeView === v.id
                  ? 'bg-gold text-navy-deep'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Chart */}
      <section className="px-4 mt-4">
        <div className="glass-card p-4">
          {activeView === 'income-expenses' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Income vs Expenses</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-0.5 rounded-full bg-success" />
                    <span className="text-[10px] text-muted-foreground">Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-0.5 rounded-full bg-danger" />
                    <span className="text-[10px] text-muted-foreground">Expenses</span>
                  </div>
                </div>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f87171" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expenses']} />
                    <Area type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} fill="url(#incomeGrad)" />
                    <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeView === 'savings' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Savings Rate Trend</h2>
                <span className="text-xs text-gold font-mono">{savingsRate}% current</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} tickFormatter={(v) => `${v}%`} domain={[0, 'auto']} />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, 'Savings Rate']} />
                    <Line type="monotone" dataKey="savingsRate" stroke="#B5A167" strokeWidth={2.5} dot={{ fill: '#B5A167', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#B5A167', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeView === 'balance' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Balance Growth</h2>
                <span className="text-xs text-gold font-mono">{formatCompact(balance)} now</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B5A167" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#B5A167" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Balance']} />
                    <Area type="monotone" dataKey="balance" stroke="#B5A167" strokeWidth={2.5} fill="url(#balanceGrad)" dot={{ fill: '#B5A167', r: 3, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeView === 'categories' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Category Spending</h2>
                <span className="text-[10px] text-muted-foreground">Last {sortedSnapshots.length} months</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.slice(0, -1)} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [formatCurrency(value), name]} />
                    {categoryNames.map(name => (
                      <Bar key={name} dataKey={name} stackId="a" fill={categoryColors[name] || '#6B8E9B'} radius={name === categoryNames[categoryNames.length - 1] ? [2, 2, 0, 0] : [0, 0, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Net Cash Flow Bar */}
      <section className="px-4 mt-5">
        <div className="glass-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Net Cash Flow</h2>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a8a9a', fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Net Cash Flow']} />
                <Bar dataKey="net" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <rect key={index} fill={entry.net >= 0 ? '#4ade80' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Monthly Detail Table */}
      <section className="px-4 mt-5">
        <div className="glass-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Monthly Detail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-2 text-muted-foreground font-medium">Month</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Income</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Expenses</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Net</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {[...sortedSnapshots].reverse().map((s) => {
                  const net = s.income - s.expenses;
                  return (
                    <tr key={s.key} className="border-b border-white/5 last:border-0">
                      <td className="py-2.5 text-foreground font-medium">
                        {MONTH_NAMES[s.month]} {s.year}
                      </td>
                      <td className="py-2.5 text-right font-mono text-success">
                        {formatCompact(s.income)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-danger">
                        {formatCompact(s.expenses)}
                      </td>
                      <td className={`py-2.5 text-right font-mono ${net >= 0 ? 'text-success' : 'text-danger'}`}>
                        {net >= 0 ? '+' : ''}{formatCompact(net)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-gold">
                        {s.savingsRate}%
                      </td>
                    </tr>
                  );
                })}
                {/* Current month row */}
                <tr className="border-t border-gold/20 bg-gold/5">
                  <td className="py-2.5 text-gold font-medium">
                    {MONTH_NAMES[new Date().getMonth()]}* <span className="text-[9px] text-muted-foreground">(current)</span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-success">
                    {formatCompact(monthlyIncome)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-danger">
                    {formatCompact(monthlyExpenses)}
                  </td>
                  <td className={`py-2.5 text-right font-mono ${monthlyIncome - monthlyExpenses >= 0 ? 'text-success' : 'text-danger'}`}>
                    +{formatCompact(monthlyIncome - monthlyExpenses)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-gold">
                    {savingsRate}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="px-4 mt-5 mb-4">
        <div className="glass-card p-4 border-gold/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
              <BarChart3 className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Trend Insights</h3>
              {stats && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Over {stats.monthsTracked} months, your average savings rate is <span className="text-gold font-medium">{stats.avgSavingsRate}%</span>. 
                    {savingsRate > stats.avgSavingsRate
                      ? ` This month you're performing above average (+${savingsRate - stats.avgSavingsRate}%).`
                      : savingsRate < stats.avgSavingsRate
                        ? ` This month you're slightly below average (${savingsRate - stats.avgSavingsRate}%).`
                        : ' You\'re right on track this month.'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your best income month was <span className="text-foreground font-medium">{formatCurrency(stats.highestIncome)}</span> and 
                    your lowest expense month was <span className="text-foreground font-medium">{formatCurrency(stats.lowestExpenses)}</span>.
                  </p>
                </div>
              )}
              {!stats && (
                <p className="text-xs text-muted-foreground mt-2">
                  Keep tracking for at least 2 months to see trend insights here.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
