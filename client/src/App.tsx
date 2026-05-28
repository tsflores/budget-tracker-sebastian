import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FinanceProvider, useFinanceContext } from "./contexts/FinanceContext";
import { BottomNav } from "./components/BottomNav";
import { AddTransactionSheet } from "./components/AddTransactionSheet";
import Home from "./pages/Home";
import Budget from "./pages/Budget";
import Transactions from "./pages/Transactions";
import Forecast from "./pages/Forecast";
import Recurring from "./pages/Recurring";
import About from "./pages/About";
import History from "./pages/History";
import Settings from "./pages/Settings";
import { InstallBanner } from "./components/InstallBanner";
import { OnboardingCarousel } from "./components/OnboardingCarousel";
import { useState, useCallback } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/budget" component={Budget} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/forecast" component={Forecast} />
      <Route path="/recurring" component={Recurring} />
      <Route path="/about" component={About} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { initialized } = useFinanceContext();
  const [setupComplete, setSetupComplete] = useState(initialized);

  const handleOnboardingComplete = useCallback(() => {
    setSetupComplete(true);
  }, []);

  // If not initialized, show the onboarding flow (required)
  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingCarousel onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // App is initialized — show the full dashboard
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <InstallBanner />
      <Router />
      <AddTransactionSheet />
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <FinanceProvider>
          <TooltipProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: 'oklch(0.22 0.04 250 / 0.95)',
                  border: '1px solid oklch(0.73 0.08 85 / 0.2)',
                  color: '#e8e8e8',
                  backdropFilter: 'blur(8px)',
                },
              }}
            />
            <AppContent />
          </TooltipProvider>
        </FinanceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
