'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useCarbonStore } from '@/lib/store';
import type { User } from '@/lib/types';

type UserRole = 'producer' | 'buyer' | 'certification_body';

interface WalletContextType {
  address: string | null;
  user: User | null;
  isConnecting: boolean;
  isConnected: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  user: null,
  isConnecting: false,
  isConnected: false,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const users = useCarbonStore((state) => state.users);

  // Get demo users for each role
  const getDemoUser = useCallback((role: UserRole): User | null => {
    return users.find((u) => u.role === role) || null;
  }, [users]);

  const login = useCallback((role: UserRole) => {
    setIsConnecting(true);
    
    // Simulate brief loading
    setTimeout(() => {
      const demoUser = getDemoUser(role);
      if (demoUser) {
        setUser(demoUser);
        localStorage.setItem('carbonx_user_role', role);
      }
      setIsConnecting(false);
    }, 300);
  }, [getDemoUser]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('carbonx_user_role');
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const demoUser = getDemoUser(role);
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem('carbonx_user_role', role);
    }
  }, [getDemoUser]);

  // Auto-login on mount if previously logged in
  useEffect(() => {
    const savedRole = localStorage.getItem('carbonx_user_role') as UserRole | null;
    if (savedRole && users.length > 0) {
      const demoUser = getDemoUser(savedRole);
      if (demoUser) {
        setUser(demoUser);
      }
    }
  }, [getDemoUser, users]);

  return (
    <WalletContext.Provider
      value={{
        address: user?.wallet_address || null,
        user,
        isConnecting,
        isConnected: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
