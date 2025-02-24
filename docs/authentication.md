## File Structure

1. **Core Files**
   ```
   src/
   ├── components/auth/
   │   ├── auth-guard.tsx      // Protected route wrapper
   │   └── wallet-button.tsx   // Wallet connection UI
   ├── hooks/
   │   ├── use-auth.ts         // Authentication state management
   │   └── use-wallet.ts       // Wallet connection management
   ├── lib/
   │   └── auth/
   │       ├── provider.tsx    // Auth context provider
   │       └── utils.ts        // Auth utility functions
   └── types/
       └── auth.ts             // Auth-related type definitions
   ```

2. **File Responsibilities**
   - `auth-guard.tsx`: Route protection and auth state checks
   - `wallet-button.tsx`: Wallet connection interface
   - `use-auth.ts`: Authentication state and methods
   - `use-wallet.ts`: Wallet connection state and methods
   - `provider.tsx`: Global auth context and state
   - `utils.ts`: Helper functions for auth operations
   - `auth.ts`: Type definitions for auth features

# Authentication Guidelines

## Core Authentication Rules

1. **Auth Component Mounting**
   - Always use `isMounted` state to prevent hydration issues during auth flows
   - Initialize mount state in useEffect with cleanup
   - Don't render auth components until mounted
   ```typescript
   const [isMounted, setIsMounted] = useState(false)
   
   useEffect(() => {
     setIsMounted(true)
     return () => setIsMounted(false)
   }, [])

   if (!isMounted) return null
   ```

2. **Wallet Connection States**
   - Handle wallet connection/disconnection gracefully
   - Show appropriate loading states during connection
   - Cleanup on wallet state changes
   ```typescript
   const [loading, setLoading] = useState(true)
   
   useEffect(() => {
     if (isMounted && connecting) {
       setLoading(true)
     }
     return () => {
       if (isMounted) {
         setLoading(false)
       }
     }
   }, [connecting, isMounted])
   ```

3. **Auth Navigation**
   - Use router.replace for auth-related navigation
   - Handle auth redirects after mount
   - Check window existence for SSR compatibility
   ```typescript
   const handleAuthNavigation = useCallback((path: string) => {
     if (isMounted && typeof window !== 'undefined') {
       router.replace(path)
     }
   }, [router, isMounted])
   ```

4. **Auth State Management**
   - Separate auth state from other application state
   - Handle auth state changes in effects
   - Provide clear auth status indicators
   ```typescript
   const checkAuthState = useCallback((): string | null => {
     if (!isMounted) return null
     if (requireAuth && !connected) return '/auth/login'
     if (!requireAuth && connected) return '/dashboard'
     return null
   }, [connected, requireAuth, isMounted])
   ```

## Protected Routes

1. **Auth Guards**
   - Implement consistent auth guards
   - Handle loading and error states
   - Provide clear feedback for unauthorized access
   ```typescript
   <AuthGuard requireAuth={true}>
     {isMounted && <ProtectedComponent />}
   </AuthGuard>
   ```

2. **Auth Context**
   - Provide wallet connection status
   - Handle auth state changes
   - Implement proper cleanup
   ```typescript
   useEffect(() => {
     if (!isMounted) return

     const handleAuthChange = () => {
       if (isMounted) {
         // Update auth state
       }
     }

     return () => {
       // Cleanup auth subscriptions
     }
   }, [isMounted])
   ```

## Error Handling

1. **Auth Errors**
   - Handle wallet connection errors
   - Provide user feedback for auth failures
   - Implement auth-specific error boundaries
   - Reset error states on auth state changes

2. **Recovery Flows**
   - Implement wallet reconnection logic
   - Handle session expiration
   - Provide clear recovery paths

## Best Practices

1. **Auth State Updates**
   - Don't update auth state during render
   - Always check mount state before auth updates
   - Keep auth state updates atomic
   - Handle edge cases explicitly

2. **Auth Navigation**
   - Use appropriate auth routes
   - Handle auth redirects consistently
   - Maintain auth state during navigation
   - Clear sensitive data on logout

3. **Security**
   - Implement proper wallet disconnect
   - Clear auth state on unmount
   - Handle auth token expiration
   - Protect sensitive routes

## Testing Auth Flows

1. **Connection Testing**
   - Test wallet connection/disconnection
   - Verify auth state persistence
   - Check error recovery flows
   - Test auth guard behavior

2. **Navigation Testing**
   - Test auth redirects
   - Verify protected route access
   - Check unauthorized access handling
   - Test auth state during navigation

3. **Error Testing**
   - Test connection failures
   - Verify error messages
   - Check recovery procedures
   - Test boundary conditions