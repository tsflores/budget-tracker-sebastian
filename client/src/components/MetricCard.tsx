/**
 * MetricCard - Vault Design System
 * Frosted glass card with gold accent for key financial metrics
 */
import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral' | undefined;
  trendValue?: string | undefined;
  icon?: ReactNode;
  accent?: boolean;
  /** When true, 'down' is shown as success (green) and 'up' as danger (red) — useful for expenses */
  invertSemantic?: boolean;
}

export function MetricCard({ title, value, subtitle, trend, trendValue, icon, accent, invertSemantic }: MetricCardProps) {
  return (
    <div className={`glass-card p-4 sm:p-5 relative overflow-hidden group ${accent ? 'gold-glow border-gold/20' : ''}`}>
      {/* Subtle background pattern */}
      {accent && (
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gold/20 to-transparent" />
      )}
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">
            {title}
          </p>
          <p className="font-display text-2xl sm:text-3xl text-foreground animate-count">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend === 'up' && <TrendingUp className={`w-3.5 h-3.5 ${invertSemantic ? 'text-danger' : 'text-success'}`} />}
          {trend === 'down' && <TrendingDown className={`w-3.5 h-3.5 ${invertSemantic ? 'text-success' : 'text-danger'}`} />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className={`text-xs font-medium font-mono ${
            trend === 'up'
              ? (invertSemantic ? 'text-danger' : 'text-success')
              : trend === 'down'
                ? (invertSemantic ? 'text-success' : 'text-danger')
                : 'text-muted-foreground'
          }`}>
            {trendValue}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}
