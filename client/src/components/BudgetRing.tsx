/**
 * BudgetRing - Circular progress indicator for budget categories
 * Vault Design: Gold-accented SVG ring with animated fill
 */

interface BudgetRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  value?: string;
}

export function BudgetRing({ 
  percentage, 
  size = 80, 
  strokeWidth = 6, 
  color = '#B5A167',
  label,
  value 
}: BudgetRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const isOverBudget = percentage > 100;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.30 0.03 250)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isOverBudget ? '#e05252' : color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
            style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-mono text-xs font-semibold ${isOverBudget ? 'text-danger' : 'text-foreground'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {label && <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>}
      {value && <span className="text-xs font-mono text-foreground">{value}</span>}
    </div>
  );
}
