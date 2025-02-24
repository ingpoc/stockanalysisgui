## Authentication Component Rules

1. **Component Mounting**
   - Always use `isMounted` state to prevent hydration issues
   - Initialize mount state in useEffect
   - Don't render anything until component is mounted
   ```typescript
   const [isMounted, setIsMounted] = useState(false)
   useEffect(() => { setIsMounted(true) }, [])
   if (!isMounted) return null
   ```

2. **State Updates During Render**
   - Never update state or navigate during render phase
   - Move all navigation logic to effects
   - Use callbacks for state updates
   ```typescript
   // ❌ Don't do this
   if (condition) router.replace('/path')
   
   // ✅ Do this
   useEffect(() => {
     if (condition) router.replace('/path')
   }, [condition])
   ```

3. **Navigation Handling**
   - Wrap navigation in useCallback
   - Check for window existence
   - Use router.replace instead of router.push for auth flows
   ```typescript
   const handleNavigation = useCallback((path: string) => {
     if (typeof window !== 'undefined') {
       router.replace(path)
     }
   }, [router])
   ```

4. **Auth State Checks**
   - Separate auth checking logic from navigation
   - Return paths instead of handling navigation directly
   - Handle all edge cases explicitly
   ```typescript
   const checkAuth = useCallback((): string | null => {
     if (!isMounted) return null
     if (requireAuth && !connected) return '/auth/login'
     if (!requireAuth && connected) return '/dashboard'
     return null
   }, [connected, requireAuth, isMounted])
   ```

5. **Loading States**
   - Show loading state during wallet connection
   - Don't show loading for quick redirects
   - Use proper loading components
   ```typescript
   if (connecting) {
     return <LoadingSpinner message="Connecting wallet..." />
   }
   ```

## Refresh and Route Protection

1. **Protected Routes**
   - Always wrap protected routes with AuthGuard
   - Set proper requireAuth prop
   - Handle loading states consistently
   ```typescript
   <AuthGuard requireAuth={true}>
     <ProtectedComponent />
   </AuthGuard>
   ```

2. **Auth Context**
   - Use proper auth context providers
   - Handle wallet connection state changes
   - Implement proper cleanup
   ```typescript
   useEffect(() => {
     return () => {
       // Cleanup subscriptions
     }
   }, [])
   ```

3. **Error Boundaries**
   - Implement error boundaries for auth components
   - Handle common auth errors gracefully
   - Provide user feedback for auth failures

## Common Pitfalls to Avoid

1. **State Updates**
   - Don't update state during render
   - Don't trigger navigation during render
   - Don't assume component is mounted

2. **Navigation**
   - Don't use router.push for auth flows
   - Don't navigate without checking window
   - Don't skip loading states

3. **Auth Checks**
   - Don't mix auth check logic with navigation
   - Don't forget to handle edge cases
   - Don't skip proper type checking

## Testing Guidelines

1. **Mount Behavior**
   - Test component behavior before mount
   - Verify proper loading states
   - Check navigation triggers

2. **Auth States**
   - Test connected/disconnected states
   - Verify proper redirects
   - Check error handling

3. **Navigation**
   - Test navigation triggers
   - Verify proper paths
   - Check loading states