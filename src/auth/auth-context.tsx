'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { signIn } from 'next-auth/react';

interface ConnectOptions {
  method: 'wallet' | 'google' | 'apple' | 'email';
}

interface AuthContextValue {
  connect: (options: ConnectOptions) => Promise<void>;
  isConnected: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { open } = useAppKit();
  const { isConnected } = useAccount();

  const connect = async ({ method }: ConnectOptions) => {
    if (method === 'wallet') {
      await open();
    } else {
      await signIn(method);
    }
  };

  const value = {
    connect,
    isConnected,
    isAuthenticated: isConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 