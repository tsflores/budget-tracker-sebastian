/**
 * InstallBanner - PWA install prompt banner
 * Shows when the app is installable but not yet installed
 */
import { useState } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Download, X } from 'lucide-react';

export function InstallBanner() {
  const { isInstallable, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="mx-4 mt-3 p-3 glass-card border-gold/20 flex items-center gap-3 animate-count">
      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
        <Download className="w-4 h-4 text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">Install FinanceFlow</p>
        <p className="text-[10px] text-muted-foreground">Add to home screen for quick access</p>
      </div>
      <button
        onClick={install}
        className="px-3 py-1.5 bg-gold text-navy-dark text-xs font-semibold rounded-md hover:bg-gold-light active:scale-95 transition-all duration-150 shrink-0"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
