/**
 * Forecast Page - 12-month cash flow forecasting
 * Vault Design: Full-width charts with gold gradients, projection cards
 */
import { useState } from 'react';
import { useFinanceContext } from '@/contexts/FinanceContext';
import { formatCurrency, formatCompact } from '@/lib/finance-store';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend, ReferenceLine, ComposedChart, Line,
} from 'recharts';

type ChartView = 'balance' | 'cashflow' | 'comparison';

export default function Forecast() {
  const { forecast, balance, monthlyIncome, monthlyExpenses, recurringTransactions } = useFinanceContext();
  const activeRecurring = recurringTransactions.filter(r => r.isActive).length;
  const [chartView, setChartView] = useState<ChartView>('balance');

  // Calculate projections
  const endBalance = forecast[forecast.length - 1]?.cumulativeBalance || 0;
  const totalProjectedIncome = forecast.reduce((sum, f) => sum + f.projectedIncome, 0);
  const totalProjectedExpenses = forecast.reduce((sum, f) => sum + f.projectedExpenses, 0);
  const avgMonthlySavings = Math.round((totalProjectedIncome - totalProjectedExpenses) / 12);
  const growthPercent = balance > 0 ? ((endBalance - balance) / balance * 100).toFixed(1) : '0.0';

  // Chart data
  const chartData = forecast.map(f => ({
    name: f.month.split(' ')[0],
    balance: f.cumulativeBalance,
    income: f.projectedIncome,
    expenses: f.projectedExpenses,
    net: f.netCashFlow,
  }));

  return (
    <div className="pb-24 safe-top">
      {/* Header with Hero Image */}
      <header className="relative px-4 pt-4 pb-6">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663183403549/aAaiETBequFcyb2jW9Meb6/forecast-visual-9NUfzxtjTJ6twpjxXsjsVU.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          }}
        />
        <div className="relative">
          <h1 className="font-display text-2xl text-foreground">Cash Flow Forecast</h1>
          <p className="text-xs text-muted-foreground mt-1">
            12-month projection · {activeRecurring} recurring {activeRecurring === 1 ? 'item' : 'items'} factored in
          </p>
        </div>
      </header>

      {/* Projection Summary Cards */}
      <section className="px-4 grid grid-cols-2 gap-3 stagger-enter">
        <div className="glass-card p-4 gold-glow">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gold" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">12-Mo Balance</span>
          </div>
          <p className="font-display text-xl text-foreground">{formatCurrency(endBalance)}</p>
          <p className="text-xs text-success font-mono mt-1">+{growthPercent}%</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Savings</span>
          </div>
          <p className="font-display text-xl text-foreground">{formatCurrency(avgMonthlySavings)}</p>
          <p className="text-xs text-muted-foreground mt-1">per month</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-chart-2" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Income</span>
          </div>
          <p className="font-display text-xl text-foreground">{formatCompact(totalProjectedIncome)}</p>
          <p className="text-xs text-muted-foreground mt-1">projected</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-danger" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Expenses</span>
          </div>
          <p className="font-display text-xl text-foreground">{formatCompact(totalProjectedExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">projected</p>
        </div>
      </section>

      {/* Chart View Toggle */}
      <section className="px-4 mt-6">
        <div className="flex gap-1.5 p-0.5 bg-muted rounded-lg w-fit">
          {[
            { key: 'balance' as ChartView, label: 'Balance' },
            { key: 'cashflow' as ChartView, label: 'Cash Flow' },
            { key: 'comparison' as ChartView, label: 'Compare' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setChartView(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                chartView === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Chart */}
      <section className="px-4 mt-4">
        <div className="glass-card p-4">
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'balance' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B5A167" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#B5A167" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 250)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8a8a9a', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8a8a9a', fontSize: 10 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.22 0.04 250 / 0.95)',
                      border: '1px solid oklch(0.73 0.08 85 / 0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#B5A167', fontSize: 11 }}
                    itemStyle={{ color: '#e8e8e8', fontSize: 12 }}
                    formatter={(value: number) => [formatCurrency(value), 'Balance']}
                  />
                  <ReferenceLine y={balance} stroke="#B5A167" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#B5A167"
                    strokeWidth={2.5}
                    fill="url(#balanceGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              ) : chartView === 'cashflow' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 250)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8a8a9a', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8a8a9a', fontSize: 10 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.22 0.04 250 / 0.95)',
                      border: '1px solid oklch(0.73 0.08 85 / 0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#B5A167', fontSize: 11 }}
                    itemStyle={{ color: '#e8e8e8', fontSize: 12 }}
                    formatter={(value: number) => [formatCurrency(value)]}
                  />
                  <Bar dataKey="net" fill="#B5A167" radius={[4, 4, 0, 0]} animationDuration={800} />
                </BarChart>
              ) : (
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 250)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8a8a9a', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8a8a9a', fontSize: 10 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.22 0.04 250 / 0.95)',
                      border: '1px solid oklch(0.73 0.08 85 / 0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#B5A167', fontSize: 11 }}
                    itemStyle={{ fontSize: 12 }}
                    formatter={(value: number) => [formatCurrency(value)]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: 10, color: '#8a8a9a' }}
                  />
                  <Bar dataKey="income" name="Income" fill="#5a9b6b" radius={[3, 3, 0, 0]} opacity={0.8} />
                  <Bar dataKey="expenses" name="Expenses" fill="#4A6FA5" radius={[3, 3, 0, 0]} opacity={0.8} />
                  <Line type="monotone" dataKey="net" name="Net" stroke="#B5A167" strokeWidth={2} dot={false} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Monthly Breakdown Table */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Monthly Breakdown</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium uppercase tracking-wider">Month</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium uppercase tracking-wider">Income</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium uppercase tracking-wider">Expenses</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium uppercase tracking-wider">Net</th>
                  <th className="text-right px-3 py-2.5 text-muted-foreground font-medium uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((f, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-foreground">{f.month}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-success">{formatCompact(f.projectedIncome)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-foreground">{formatCompact(f.projectedExpenses)}</td>
                    <td className={`px-3 py-2.5 text-right font-mono ${f.netCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                      {f.netCashFlow >= 0 ? '+' : ''}{formatCompact(f.netCashFlow)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-gold">{formatCompact(f.cumulativeBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Insights</h2>
        <div className="space-y-3">
          <div className="glass-card p-4 border-l-2 border-l-gold">
            <p className="text-sm text-foreground font-medium">Projected Growth</p>
            <p className="text-xs text-muted-foreground mt-1">
              At your current savings rate, your balance will grow by {formatCurrency(endBalance - balance)} over the next 12 months — a {growthPercent}% increase.
            </p>
          </div>
          <div className="glass-card p-4 border-l-2 border-l-success">
            <p className="text-sm text-foreground font-medium">Savings Milestone</p>
            <p className="text-xs text-muted-foreground mt-1">
              You're on track to reach {formatCurrency(Math.ceil(endBalance / 10000) * 10000)} by {forecast[forecast.length - 1]?.month}. Keep up the consistent savings habit.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
