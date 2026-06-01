import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FinanceProvider, useFinanceContext } from "./contexts/FinanceContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="size-8 animate-spin text-gold" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading]);

  if (isLoading) return <LoadingScreen />;
  if (!user) return null;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && user) navigate('/');
  }, [user, isLoading]);

  if (isLoading) return <LoadingScreen />;
  if (user) return null;
  return <>{children}</>;
}

function AuthenticatedApp() {
  const { initialized, isLoading } = useFinanceContext();

  if (isLoading) return <LoadingScreen />;

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingCarousel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <InstallBanner />
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
      <AddTransactionSheet />
      <BottomNav />
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute><Login /></PublicRoute>
      </Route>
      <Route path="/register">
        <PublicRoute><Register /></PublicRoute>
      </Route>
      <Route>
        <ProtectedRoute>
          <FinanceProvider>
            <AuthenticatedApp />
          </FinanceProvider>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
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
            <AppRouter />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
