/**
 * BottomNav - Mobile-first bottom navigation bar
 * Vault Design: Fixed bottom nav with gold active indicator
 */
import { useLocation, Link } from 'wouter';
import { LayoutDashboard, Wallet, ArrowLeftRight, TrendingUp, RefreshCw } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/budget', label: 'Budget', icon: Wallet },
  { path: '/transactions', label: 'Activity', icon: ArrowLeftRight },
  { path: '/recurring', label: 'Recurring', icon: RefreshCw },
  { path: '/forecast', label: 'Forecast', icon: TrendingUp },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy-dark/95 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all duration-200 relative
                ${isActive 
                  ? 'text-gold' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-gold" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
