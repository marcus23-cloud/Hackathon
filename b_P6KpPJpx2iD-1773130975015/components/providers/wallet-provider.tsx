'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/lib/types';

interface WalletContextType {
  address: string | null;
  user: User | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  user: null,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  signer: null,
  provider: null,
});

export function useWallet() {
  return useContext(WalletContext);
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const fetchOrCreateUser = useCallback(async (walletAddress: string) => {
    const supabase = createClient();
    
    // Try to fetch existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (existingUser) {
      setUser(existingUser);
      return existingUser;
    }

    // Create new user (default to producer for demo purposes)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        role: 'producer',
        display_name: `User ${walletAddress.slice(0, 6)}`,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    setUser(newUser);
    return newUser;
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to connect your wallet');
      return;
    }

    setIsConnecting(true);

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        const walletSigner = await browserProvider.getSigner();
        const walletAddress = await walletSigner.getAddress();
        
        setProvider(browserProvider);
        setSigner(walletSigner);
        setAddress(walletAddress);
        
        await fetchOrCreateUser(walletAddress);
        
        // Store in localStorage for persistence
        localStorage.setItem('carbonx_wallet', walletAddress);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchOrCreateUser]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setUser(null);
    setSigner(null);
    setProvider(null);
    localStorage.removeItem('carbonx_wallet');
  }, []);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const savedWallet = localStorage.getItem('carbonx_wallet');
    if (savedWallet && window.ethereum) {
      connect();
    }
  }, [connect]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== address) {
          setAddress(accounts[0]);
          fetchOrCreateUser(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [address, disconnect, fetchOrCreateUser]);

  return (
    <WalletContext.Provider
      value={{
        address,
        user,
        isConnecting,
        isConnected: !!address,
        connect,
        disconnect,
        signer,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
