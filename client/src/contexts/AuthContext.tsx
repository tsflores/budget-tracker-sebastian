import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { register as apiRegister, login as apiLogin, getMe } from '@/lib/auth-api';
import type { AuthUser } from '@/lib/auth-api';

const TOKEN_KEY = 'financeflow_token';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }

  async function register(email: string, password: string) {
    const { token, user } = await apiRegister(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    navigate('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
