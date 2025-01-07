'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieStorage, createStorage, http } from '@wagmi/core';
import { mainnet } from 'wagmi/chains';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_REOWN_PROJECT_ID: string;
      NEXT_PUBLIC_APP_URL: string;
    }
  }
}

// Set up the Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
  networks: [mainnet]
});

// Create the AppKit instance
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '',
  networks: [mainnet],
  defaultNetwork: mainnet,
  metadata: {
    name: 'Stock Analysis Dashboard',
    description: 'Real-time stock analysis and insights',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  }
});

type AppKitContextType = typeof appKit;

const AuthContext = createContext<AppKitContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={appKit}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AppKitContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 