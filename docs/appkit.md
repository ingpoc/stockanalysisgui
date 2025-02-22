# AppKit Documentation

## Package Structure
```typescript
// Main exports
import { createAppKit, AppKit } from '@reown/appkit';
import type { AppKitOptions } from '@reown/appkit';

// Framework-specific exports
import { useAppKit } from '@reown/appkit/react';
import { useAppKit } from '@reown/appkit/vue';

// Library components
import { AppKitProvider } from '@reown/appkit/library/react';
import { AppKitProvider } from '@reown/appkit/library/vue';

// Store management
import { useStore } from '@reown/appkit/store';

// Network utilities
import { polygon, solana } from '@reown/appkit/networks';

// Authentication
import { useAuth } from '@reown/appkit/auth-provider';

// Utility functions
import { CoreHelperUtil } from '@reown/appkit/utils';
```

## Installation
```bash
# Using CLI (recommended)
npx @reown/appkit-cli

# Manual installation
npm install @reown/appkit @reown/appkit-adapter-wagmi @reown/appkit-adapter-solana wagmi viem @tanstack/react-query
```

## Configuration
```typescript
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { polygon, solana } from '@reown/appkit/networks';
import type { AppKitNetwork, AppKitOptions } from '@reown/appkit';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Commitment } from '@solana/web3.js';
import { cookieStorage, createStorage } from 'wagmi';

// Network Configuration
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [polygon, solana];

// Wagmi Adapter (EVM)
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  networks: [polygon],
});

// Solana Adapter
const solanaAdapter = new SolanaAdapter({
  connectionSettings: 'confirmed' as Commitment,
  wallets: [new PhantomWalletAdapter()],
  autoConnect: true,
});

// AppKit Configuration
const appKit = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  networks,
  defaultNetwork: polygon,
  metadata: {
    name: 'Your App',
    description: 'App Description',
    url: process.env.NEXT_PUBLIC_APP_URL,
    icons: ['https://your-icon.com']
  },
  themeMode: 'dark',
  auth: {
    enabled: true,
    providers: ['siwe'],
    storage: 'local'
  }
});
```

## Framework Integration

### React
```typescript
import { AppKitProvider } from '@reown/appkit/library/react';
import { useAppKit, useAuth, useStore } from '@reown/appkit/react';

function App() {
  return (
    <AppKitProvider appKit={appKit}>
      <YourApp />
    </AppKitProvider>
  );
}

function YourApp() {
  const { address, isConnected } = useAppKit();
  const { signIn, signOut } = useAuth();
  const store = useStore();
  
  // Your app logic
}
```

### Vue
```typescript
import { AppKitProvider } from '@reown/appkit/library/vue';
import { useAppKit, useAuth, useStore } from '@reown/appkit/vue';

// Similar Vue implementation...
```

## Type System
```typescript
// Network Types
import type { 
  CaipNetwork,
  CaipAddress, 
  CaipNetworkId 
} from '@reown/appkit';

// Configuration Types
import type {
  AppKitOptions,
  CreateAppKit,
  AdapterOptions
} from '@reown/appkit';

// Auth Types
import type {
  AuthConfig,
  AuthProvider,
  AuthState
} from '@reown/appkit/auth-provider';
```

## Store Management
```typescript
import { useStore } from '@reown/appkit/store';

function YourComponent() {
  const store = useStore();
  
  // Access store state
  const { networkState, accountState, authState } = store;
  
  // Subscribe to changes
  useEffect(() => {
    const unsubscribe = store.subscribe(
      state => state.networkState,
      (newState) => {
        // Handle network state changes
      }
    );
    return unsubscribe;
  }, []);
}
```

## Authentication
```typescript
import { useAuth } from '@reown/appkit/auth-provider';
import { useAppKit } from '@reown/appkit/react';
import { useRouter } from 'next/router';

function AuthComponent() {
  const router = useRouter();
  const { 
    signIn, 
    signOut, 
    isAuthenticated, 
    user 
  } = useAuth();
  const { 
    address, 
    isConnected, 
    status,
    chainId,
    disconnect
  } = useAppKit();
  
  // Handle chain-specific authentication
  const handleSignIn = async () => {
    try {
      // For EVM chains
      if (chainId?.startsWith('eip155')) {
        await signIn('siwe');
        router.push('/dashboard');
      } 
      // For Solana
      else if (chainId?.startsWith('solana')) {
        // Solana requires explicit provider type
        await signIn('solana', {
          providerType: 'solana',
          // Add any Solana-specific sign message options
          signMessage: {
            message: 'Sign in to Stock Analysis Dashboard',
            domain: window.location.host
          }
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth failed:', error);
      // Handle specific error cases
      if (error.message?.includes('providerType not provided')) {
        // Attempt recovery by specifying provider
        await disconnect();
        await signIn(chainId?.startsWith('solana') ? 'solana' : 'siwe');
      }
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      // Always specify provider type when disconnecting
      await disconnect({
        providerType: chainId?.startsWith('solana') ? 'solana' : 'evm'
      });
      
      // Clear auth state
      await signOut();
      
      // Reset local state
      router.push('/auth/login');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };
}
```

## Chain-Specific Configuration
```typescript
// AppKit Configuration with Chain-Specific Auth
const appKit = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  networks,
  defaultNetwork: polygon,
  metadata: {
    name: 'Your App',
    description: 'App Description',
    url: process.env.NEXT_PUBLIC_APP_URL,
    icons: ['https://your-icon.com']
  },
  themeMode: 'dark',
  auth: {
    enabled: true,
    providers: ['siwe', 'solana'],
    storage: 'local',
    // Chain-specific auth options
    chainConfig: {
      solana: {
        signMessage: {
          message: 'Sign in to Stock Analysis Dashboard',
          domain: window.location.host
        }
      },
      evm: {
        // EVM-specific options
        statement: 'Sign in to Stock Analysis Dashboard',
        version: '1'
      }
    }
  }
});
```

## Protected Routes
```typescript
import { useEffect } from 'react';
import { useAuth } from '@reown/appkit/auth-provider';
import { useAppKit } from '@reown/appkit/react';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { status, chainId } = useAppKit();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Handle chain-specific redirects
    if (isAuthenticated && status === 'connected') {
      if (chainId?.startsWith('solana')) {
        // Ensure Solana-specific initialization is complete
        ensureSolanaInit().then(() => {
          router.push('/dashboard');
        });
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, status, chainId]);

  if (loading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return children;
}
```

## Error Handling
```typescript
import { useAppKit } from '@reown/appkit/react';

function ErrorBoundary() {
  const { error, resetError, chainId } = useAppKit();
  
  const handleError = async () => {
    try {
      // Chain-specific error recovery
      if (error?.message?.includes('providerType not provided')) {
        await disconnect({
          providerType: chainId?.startsWith('solana') ? 'solana' : 'evm'
        });
        resetError();
      }
    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError);
    }
  };
  
  if (error) {
    return (
      <div>
        <h3>Error: {error.message}</h3>
        <button onClick={handleError}>Try Again</button>
      </div>
    );
  }
  
  return null;
}
```

## Best Practices for Chain-Specific Authentication
1. Always specify `providerType` when:
   - Disconnecting from any chain
   - Handling Solana authentication
   - Recovering from provider errors

2. Handle Chain-Specific States:
   - Check `chainId` for appropriate auth method
   - Use chain-specific sign message formats
   - Implement proper error recovery per chain

3. Authentication Flow:
   - EVM: Uses SIWE (Sign-In with Ethereum)
   - Solana: Requires explicit provider configuration
   - Handle chain switching during auth

4. Error Recovery:
   - Implement chain-specific error handling
   - Provide fallback authentication methods
   - Clear state on authentication failures

5. State Management:
   - Track chain-specific connection states
   - Handle network switching during auth
   - Maintain consistent auth state across chains

## Best Practices
1. Always use framework-specific exports
2. Implement proper error boundaries
3. Use type-safe network configurations
4. Handle authentication state properly
5. Subscribe to store changes efficiently
6. Clean up subscriptions on unmount

## Updates and Maintenance
This documentation should be updated when:
1. New package versions are released
2. API changes are made
3. New features are added
4. Breaking changes occur
5. Best practices evolve

Last verified: [Current Date]
Package version: 1.6.4

## Chain State Management
```typescript
import { useEffect } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAuth } from '@reown/appkit/auth-provider';

function useChainState() {
  const { 
    status, 
    chainId, 
    isConnected,
    disconnect
  } = useAppKit();
  const { isAuthenticated } = useAuth();

  // Handle connection lifecycle
  useEffect(() => {
    // Reset state on chain change
    const handleChainChange = async () => {
      try {
        // Always disconnect with provider type
        await disconnect({
          providerType: chainId?.startsWith('solana') ? 'solana' : 'evm'
        });
      } catch (error) {
        console.error('Chain change cleanup failed:', error);
      }
    };

    // Handle connection state
    if (isConnected && !isAuthenticated) {
      handleChainChange();
    }

    return () => {
      // Cleanup on unmount
      if (isConnected) {
        handleChainChange();
      }
    };
  }, [chainId, isConnected, isAuthenticated]);

  // Handle initial state
  useEffect(() => {
    if (status === 'disconnected') {
      // Reset any chain-specific state
      resetChainState();
    }
  }, [status]);
}

// Chain-specific initialization
async function ensureSolanaInit() {
  return new Promise((resolve) => {
    const checkConnection = () => {
      const connection = new Connection(solana.rpcUrls.default.http[0]);
      connection.getVersion()
        .then(() => resolve(true))
        .catch(() => setTimeout(checkConnection, 500));
    };
    checkConnection();
  });
}

// Usage in components
function AuthenticatedApp() {
  const { chainId, status } = useAppKit();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (status === 'connected') {
      if (chainId?.startsWith('solana')) {
        // Ensure Solana is ready
        ensureSolanaInit().then(() => setIsReady(true));
      } else {
        // EVM chains are ready immediately
        setIsReady(true);
      }
    } else {
      setIsReady(false);
    }
  }, [chainId, status]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <YourApp />;
}
```

## Connection Lifecycle
1. **Initial Connection**:
   ```typescript
   function ConnectionHandler() {
     const { status, chainId } = useAppKit();
     const { isAuthenticated } = useAuth();

     useEffect(() => {
       // Track connection attempts
       const attempts = {
         count: 0,
         lastAttempt: Date.now()
       };

       const handleConnection = async () => {
         try {
           if (status === 'connecting') {
             // Wait for connection to complete
             if (Date.now() - attempts.lastAttempt > 5000) {
               // Reset if taking too long
               await disconnect({
                 providerType: chainId?.startsWith('solana') ? 'solana' : 'evm'
               });
             }
           }
         } catch (error) {
           console.error('Connection handling failed:', error);
         }
       };

       const interval = setInterval(handleConnection, 1000);
       return () => clearInterval(interval);
     }, [status, chainId]);
   }
   ```

2. **Reconnection Handling**:
   ```typescript
   function ReconnectionHandler() {
     const { status, chainId, connect } = useAppKit();
     const [reconnecting, setReconnecting] = useState(false);

     useEffect(() => {
       if (status === 'disconnected' && reconnecting) {
         // Attempt reconnect with proper provider
         connect({
           providerType: chainId?.startsWith('solana') ? 'solana' : 'evm'
         }).finally(() => setReconnecting(false));
       }
     }, [status, chainId, reconnecting]);
   }
   ```

## Common Issues and Solutions

### 1. Provider Type Errors
```typescript
// Problem: Failed to disconnect chain: Provider or providerType not provided
// Solution: Always include providerType in disconnect calls
const handleDisconnect = async () => {
  try {
    await disconnect({
      providerType: chainId?.startsWith('solana') ? 'solana' : 'evm',
      // Optional: Force disconnect even if provider is not available
      force: true
    });
  } catch (error) {
    // Handle specific error cases
    if (error.message?.includes('providerType not provided')) {
      // Attempt force disconnect
      await disconnect({
        providerType: 'solana',
        force: true
      });
      await disconnect({
        providerType: 'evm',
        force: true
      });
    }
  }
};
```

### 2. Solana Authentication Issues
```typescript
// Problem: Solana login not redirecting
// Solution: Ensure proper initialization and state management
const handleSolanaAuth = async () => {
  try {
    // 1. Ensure clean state
    await disconnect({
      providerType: 'solana',
      force: true
    });

    // 2. Connect with explicit provider
    await signIn('solana', {
      providerType: 'solana',
      signMessage: {
        message: 'Sign in to App',
        domain: window.location.host
      }
    });

    // 3. Verify connection
    const isInitialized = await ensureSolanaInit();
    if (!isInitialized) {
      throw new Error('Failed to initialize Solana connection');
    }

    // 4. Redirect only after initialization
    router.push('/dashboard');
  } catch (error) {
    console.error('Solana auth failed:', error);
    // Reset state on failure
    await disconnect({
      providerType: 'solana',
      force: true
    });
  }
};
```

### 3. State Management
```typescript
// Problem: Inconsistent state after chain switching
// Solution: Implement proper state cleanup
const handleChainSwitch = async () => {
  try {
    // 1. Clear existing state
    await disconnect({
      providerType: chainId?.startsWith('solana') ? 'solana' : 'evm'
    });

    // 2. Reset auth state
    await signOut();

    // 3. Clear local storage
    localStorage.removeItem('walletconnect');
    localStorage.removeItem('solana-wallet');

    // 4. Reset app state
    resetAppState();

    // 5. Redirect to login
    router.push('/auth/login');
  } catch (error) {
    console.error('Chain switch failed:', error);
  }
};
```

# AppKit Integration Guide

## Common Issues and Solutions

### 1. Chain Disconnection Handling

#### Problem
Chain disconnection errors can occur when:
- Cleanup is not properly handled
- Local storage is not cleared
- Subscriptions are not properly unsubscribed
- State updates occur after component unmount

#### Solution
```typescript
// Proper disconnection handling
const disconnect = async () => {
  // 1. Set disconnecting state
  setIsDisconnecting(true)
  
  // 2. Wait for pending operations
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 3. Clear storage with fallback
  const walletKeys = [
    'walletconnect',
    'solana-wallet',
    'wagmi.cache',
    'wagmi.connected',
    'wagmi.wallet',
    'wagmi.network',
    'wagmi.account'
  ]
  
  try {
    walletKeys.forEach(key => localStorage.removeItem(key))
  } catch (e) {
    localStorage.clear() // Fallback
  }
  
  // 4. Close connection
  await close()
}
```

### 2. Session Persistence

#### Problem
Users being logged out on page refresh due to:
- Session not being properly validated
- Race conditions in initialization
- Missing cleanup on unmount

#### Solution
```typescript
// Auth layout with proper session handling
const AuthLayout = () => {
  // 1. Check session first
  const sessionResponse = await fetch('/api/auth/session')
  const hasValidSession = sessionResponse.ok
  
  // 2. Handle initialization
  if (!isConnected && !hasValidSession) {
    await close()
    return router.replace('/login')
  }
  
  // 3. Cleanup on unmount
  useEffect(() => {
    let mounted = true
    return () => { mounted = false }
  }, [])
}
```

### 3. Signature Handling

#### Problem
Poor user experience during signature requests:
- Unclear error messages
- No context about the signature purpose
- Missing error recovery

#### Solution
```typescript
// SIWE configuration with better UX
const siweConfig = {
  createMessage: ({ address, chainId, nonce }) => `
    Welcome to Our App!
    
    This signature is required to verify your wallet ownership.
    It will not trigger any blockchain transaction or cost any gas fees.
    
    Wallet: ${address}
    Chain: ${chainId}
    Nonce: ${nonce}
    
    By signing, you agree to our Terms of Service.
  `,
  
  verifyMessage: async ({ message, signature }) => {
    try {
      const response = await verify(message, signature)
      return response.ok
    } catch (error) {
      if (error.message?.includes('User denied')) {
        throw new Error('You must sign the message to continue')
      }
      throw new Error('Verification failed. Please try again.')
    }
  }
}
```

## Best Practices

1. **Cleanup**
   - Always cleanup subscriptions
   - Clear relevant localStorage items
   - Handle component unmounting
   - Use timeouts for async operations

2. **Error Handling**
   - Provide clear error messages
   - Handle specific error cases
   - Include recovery mechanisms
   - Log errors for debugging

3. **State Management**
   - Track connection status
   - Handle race conditions
   - Manage loading states
   - Cleanup on unmount

4. **User Experience**
   - Clear signature messages
   - Informative error states
   - Loading indicators
   - Smooth transitions

## Common Gotchas

1. Always check mounted state before updates
2. Clear ALL relevant localStorage items
3. Handle both connection and session state
4. Provide proper cleanup mechanisms
5. Use proper TypeScript types

## Updates and Maintenance

Last updated: [Current Date]
Package version: [Current Version]

Remember to update this documentation when:
1. New issues are discovered
2. Better solutions are found
3. API changes occur
4. Best practices evolve

## Wallet Connection & Disconnection

### Disconnection Flow
```typescript
// Proper disconnection handling with SIWE
const handleDisconnect = async () => {
  try {
    // 1. Set disconnecting state to prevent redirects
    setIsDisconnecting(true)
    
    // 2. Clear SIWE session first
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include'
    })
    
    // 3. Wait for pending operations
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 4. Close wallet connection
    await close()
    
    // 5. Clear local storage
    const walletKeys = [
      'walletconnect',
      'solana-wallet',
      'wagmi.cache',
      'wagmi.connected',
      'wagmi.wallet',
      'wagmi.network',
      'wagmi.account'
    ]
    walletKeys.forEach(key => localStorage.removeItem(key))
    
    // 6. Redirect to login
    router.replace('/auth/login')
  } catch (error) {
    console.error('Disconnect failed:', error)
    // Force cleanup on error
    localStorage.clear()
    router.replace('/auth/login')
  } finally {
    setIsDisconnecting(false)
  }
}
```

### Auth Layout Handling
```typescript
// Auth layout with proper disconnect handling
function AuthLayout() {
  const { isConnected, status } = useAppKitAccount()
  const { isDisconnecting } = useWallet()
  
  useEffect(() => {
    // Skip redirects during disconnect
    if (isDisconnecting) return
    
    // Check session and connection
    const checkAuth = async () => {
      const sessionResponse = await fetch('/api/auth/session')
      const hasSession = sessionResponse.ok
      
      if (!isConnected && !hasSession) {
        router.replace('/auth/login')
      }
    }
    
    checkAuth()
  }, [isConnected, status, isDisconnecting])
}
```

### Common Issues

1. **Redirect Loops**
   - Problem: Redirects between login and dashboard during disconnect
   - Solution: Use isDisconnecting state to prevent redirects during cleanup
   - Example: Check isDisconnecting before any auth-related redirects

2. **Session Persistence**
   - Problem: Session remains after wallet disconnect
   - Solution: Clear SIWE session before wallet disconnection
   - Example: Call signout endpoint before closing connection

3. **State Cleanup**
   - Problem: Incomplete state cleanup causing reconnection issues
   - Solution: Clear all wallet-related localStorage items
   - Example: Maintain a list of wallet keys to clear

### Best Practices

1. **Disconnection Order**
   - Clear SIWE session first
   - Wait for pending operations
   - Close wallet connection
   - Clear local storage
   - Redirect to login

2. **State Management**
   - Track disconnecting state
   - Prevent redirects during cleanup
   - Handle cleanup errors gracefully
   - Clear all related storage

3. **Error Handling**
   - Catch and log disconnect errors
   - Provide fallback cleanup
   - Force clear storage on errors
   - Always redirect to login

4. **User Experience**
   - Show loading state during disconnect
   - Provide feedback on errors
   - Ensure clean transition to login
   - Prevent UI interactions during disconnect

### Implementation Checklist

- [ ] Implement isDisconnecting state
- [ ] Add SIWE session cleanup
- [ ] Clear all wallet storage
- [ ] Handle cleanup errors
- [ ] Prevent redirect loops
- [ ] Add loading states
- [ ] Test all disconnect scenarios

### Version Compatibility

- AppKit Version: 1.6.4+
- SIWE Version: Latest
- Supported Chains: EVM, Solana

Last Updated: March 2024
```

## SIWE Integration

### Configuration
```typescript
const siweConfig = createSIWEConfig({
  enabled: true,
  nonceRefetchIntervalMs: 60000,
  signOutOnDisconnect: true,
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
  createMessage: ({ address, chainId, nonce }) => `
    Welcome to Our App!
    
    This signature is required to verify your wallet ownership.
    It will not trigger any blockchain transaction or cost any gas fees.
    
    Wallet: ${address}
    Chain: ${chainId}
    Nonce: ${nonce}
    
    By signing, you agree to our Terms of Service.
  `,
  verifyMessage: async ({ message, signature }) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
        credentials: 'include'
      })
      return response.ok
    } catch (error) {
      if (error.message?.includes('User denied')) {
        throw new Error('You must sign the message to continue')
      }
      throw error
    }
  }
})
```

### Auth Layout Implementation
```typescript
function AuthLayout({ children }) {
  const { isConnected, status } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { isDisconnecting } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const checkAuth = async () => {
      // Skip during disconnect
      if (isDisconnecting) return
      
      try {
        // Check session first
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include'
        })
        
        if (mounted) {
          setHasSession(sessionResponse.ok)
          setIsLoading(false)
        }
        
        // Handle auth state
        if (!isConnected && !sessionResponse.ok) {
          router.replace('/auth/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (mounted) {
          setIsLoading(false)
          setHasSession(false)
        }
        router.replace('/auth/login')
      }
    }
    
    checkAuth()
    
    return () => {
      mounted = false
    }
  }, [isConnected, status, isDisconnecting])

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Show children only if authenticated
  return isConnected || hasSession ? children : null
}
```

### Chain-Specific Handling

1. **EVM Chains**
```typescript
if (chainId?.startsWith('eip155')) {
  await signIn('siwe', {
    message: 'Sign in with Ethereum to access the app',
    redirect: false
  })
}
```

2. **Solana**
```typescript
if (chainId?.startsWith('solana')) {
  await signIn('solana', {
    providerType: 'solana',
    signMessage: {
      message: 'Sign in to access the app',
      domain: window.location.host
    }
  })
}
```

### Error Recovery

1. **Provider Type Errors**
```typescript
try {
  await disconnect({
    providerType: chainId?.startsWith('solana') ? 'solana' : 'evm',
    force: true
  })
} catch (error) {
  if (error.message?.includes('providerType not provided')) {
    // Try both providers
    await Promise.allSettled([
      disconnect({ providerType: 'solana', force: true }),
      disconnect({ providerType: 'evm', force: true })
    ])
  }
}
```

2. **Session Cleanup**
```typescript
const cleanupSession = async () => {
  try {
    // Clear SIWE session
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include'
    })
    
    // Clear local storage
    const walletKeys = [
      'walletconnect',
      'solana-wallet',
      'wagmi.cache',
      'wagmi.connected'
    ]
    walletKeys.forEach(key => localStorage.removeItem(key))
    
    // Force clear as fallback
    localStorage.clear()
  } catch (error) {
    console.warn('Session cleanup failed:', error)
    // Still proceed with disconnect
  }
}
```

### Best Practices

1. **Session Management**
   - Always check session before connection state
   - Handle both session and connection cleanup
   - Use proper error boundaries
   - Implement retry mechanisms

2. **State Synchronization**
   - Track mounted state in effects
   - Handle race conditions
   - Clean up subscriptions
   - Use proper loading states

3. **Error Handling**
   - Provide clear error messages
   - Implement recovery mechanisms
   - Log errors appropriately
   - Handle chain-specific errors

4. **Security**
   - Clear all sensitive data
   - Handle session expiration
   - Validate signatures properly
   - Implement proper CORS

### Common Gotchas

1. **Race Conditions**
   - Problem: State updates after unmount
   - Solution: Use mounted flag in effects
   - Example: Check mounted before setState

2. **Session Persistence**
   - Problem: Stale session after disconnect
   - Solution: Clear both session and storage
   - Example: Implement proper cleanup order

3. **Chain Switching**
   - Problem: Inconsistent state during switch
   - Solution: Handle chain-specific cleanup
   - Example: Use proper provider types

### Testing Checklist

- [ ] Test connection flow
- [ ] Test disconnection flow
- [ ] Test session persistence
- [ ] Test error recovery
- [ ] Test chain switching
- [ ] Test race conditions
- [ ] Test cleanup order

### Version Compatibility

- AppKit: 1.6.4+
- SIWE: Latest
- Next.js: 13+
- React: 18+

Last Updated: March 2024
```

# Session Management and Cleanup

## Smart Sessions
Smart Sessions allow for granular permission handling within dApps. They provide a way to:
- Manage session-based permissions
- Handle permission requests efficiently
- Maintain session state across disconnects

## Session Cleanup Best Practices

### Order of Operations
1. Set disconnecting state flag
2. Clear SIWE session first
3. Clean up smart sessions if used
4. Close wallet connection
5. Clear local storage
6. Reset state variables
7. Redirect to login

### Implementation Guidelines
```typescript
// In your useWallet hook:
const disconnect = async () => {
  try {
    setIsDisconnecting(true);
    
    // 1. Clear SIWE session first
    await fetch('/api/auth/signout', { 
      method: 'POST',
      credentials: 'include'
    });

    // 2. Clean up smart sessions if used
    if (modal.smartSession) {
      await modal.smartSession.cleanup();
    }

    // 3. Close wallet connection
    await modal.disconnect();

    // 4. Clear any local storage
    localStorage.removeItem('walletconnect');
    localStorage.removeItem('wagmi.wallet');
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('wagmi.network');

    // 5. Reset state
    setAccount(null);
    setChainId(null);
    
    // 6. Redirect only after cleanup
    router.replace('/auth/login');
  } catch (error) {
    console.error('Disconnect error:', error);
  } finally {
    setIsDisconnecting(false);
  }
};
```

### Error Recovery
- Implement timeout for cleanup operations
- Have fallback cleanup if primary fails
- Log cleanup errors for debugging
- Reset state even if cleanup fails

### Testing Checklist
- [ ] Test disconnect during active operations
- [ ] Verify no lingering sessions after disconnect
- [ ] Check redirect behavior with slow connections
- [ ] Validate state reset after cleanup
- [ ] Test error recovery scenarios

### Common Pitfalls
1. Not waiting for cleanup before redirect
2. Missing smart session cleanup
3. Incomplete local storage cleanup
4. Race conditions in state updates
5. Not handling cleanup timeouts

## Version Compatibility
- AppKit v1.6.8 or later required for smart sessions
- SIWE v2.0+ recommended for secure session handling
- Check ethers version compatibility (v6 recommended)

## Updates and Maintenance

Last updated: [Current Date]
Package version: [Current Version]

Remember to update this documentation when:
1. New issues are discovered
2. Better solutions are found
3. API changes occur
4. Best practices evolve

### Comprehensive Error Handling

#### Types of Errors to Handle
1. Network Errors
   - Connection timeouts
   - API endpoint failures
   - Network state inconsistencies

2. Provider Errors
   - Provider not found
   - Provider method not supported
   - Chain ID mismatch

3. Session Errors
   - Session already cleared
   - Invalid session state
   - Session cleanup timeout

4. State Management Errors
   - Race conditions
   - Stale state
   - Incomplete cleanup

#### Implementation Example
```typescript
const disconnect = async () => {
  const CLEANUP_TIMEOUT = 10000; // 10 seconds
  const cleanup = { completed: false };
  
  try {
    setIsDisconnecting(true);
    
    // Setup cleanup timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        if (!cleanup.completed) {
          reject(new Error('Cleanup timeout'));
        }
      }, CLEANUP_TIMEOUT);
    });

    // Main cleanup logic with timeout race
    await Promise.race([
      (async () => {
        try {
          // 1. Clear SIWE session
          const signoutRes = await fetch('/api/auth/signout', {
            method: 'POST',
            credentials: 'include'
          });
          
          if (!signoutRes.ok) {
            throw new Error(`Signout failed: ${signoutRes.status}`);
          }

          // 2. Smart session cleanup
          if (modal.smartSession) {
            try {
              await modal.smartSession.cleanup();
            } catch (err) {
              console.warn('Smart session cleanup failed:', err);
              // Continue with other cleanup steps
            }
          }

          // 3. Provider disconnect
          try {
            await modal.disconnect();
          } catch (err) {
            console.warn('Provider disconnect failed:', err);
            // Attempt force disconnect
            if (modal.provider?.disconnect) {
              await modal.provider.disconnect();
            }
          }

          // 4. Storage cleanup with verification
          const storageKeys = [
            'walletconnect',
            'wagmi.wallet',
            'wagmi.store',
            'wagmi.network'
          ];
          
          storageKeys.forEach(key => {
            try {
              localStorage.removeItem(key);
              // Verify removal
              if (localStorage.getItem(key)) {
                console.warn(`Failed to remove ${key} from storage`);
              }
            } catch (err) {
              console.warn(`Storage cleanup failed for ${key}:`, err);
            }
          });

          cleanup.completed = true;
        } catch (err) {
          throw new Error(`Cleanup failed: ${err.message}`);
        }
      })(),
      timeoutPromise
    ]);

    // Only redirect after successful cleanup
    router.replace('/auth/login');
  } catch (error) {
    console.error('Disconnect error:', error);
    
    // Determine error type and handle accordingly
    if (error.message.includes('timeout')) {
      // Handle timeout - force cleanup
      forceCleanup();
    } else if (error.message.includes('provider')) {
      // Handle provider errors
      handleProviderError(error);
    } else {
      // Handle other errors
      handleGeneralError(error);
    }
  } finally {
    // Ensure state is reset regardless of errors
    setIsDisconnecting(false);
    setAccount(null);
    setChainId(null);
  }
};

// Helper functions for error handling
const forceCleanup = () => {
  // Force clear all possible states
  localStorage.clear();
  sessionStorage.clear();
  if (window.ethereum) {
    try {
      window.ethereum.removeAllListeners();
    } catch (err) {
      console.warn('Failed to remove ethereum listeners:', err);
    }
  }
};

const handleProviderError = (error) => {
  // Log provider specific error
  console.error('Provider error:', error);
  // Attempt alternative disconnect method
  if (window.ethereum?.disconnect) {
    window.ethereum.disconnect()
      .catch(err => console.warn('Alternative disconnect failed:', err));
  }
};

const handleGeneralError = (error) => {
  // Log error for debugging
  console.error('General disconnect error:', error);
  // Implement fallback cleanup
  forceCleanup();
};
```

#### Error Recovery Strategy
1. **Timeout Handling**
   - Set reasonable timeouts for each cleanup step
   - Implement fallback cleanup for timeout cases
   - Log timeout occurrences for monitoring

2. **Fallback Mechanisms**
   - Multiple disconnect attempt methods
   - Force cleanup as last resort
   - State reset regardless of cleanup success

3. **User Experience**
   - Clear error messages for users
   - Graceful degradation on failure
   - Automatic retry for transient errors

4. **Monitoring and Debugging**
   - Detailed error logging
   - Error tracking and analytics
   - Performance monitoring for cleanup steps

// ... existing code ...