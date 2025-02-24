# Navigation Guidelines

## Core Navigation Rules

1. **Navigation Setup**
   - Wrap navigation in useCallback
   - Check for window existence
   - Handle navigation timing
   - Check mount state before navigation
   ```typescript
   const navigate = useCallback((path: string) => {
     if (isMounted && typeof window !== 'undefined') {
       router.push(path)
     }
   }, [router, isMounted])
   ```

2. **Navigation Timing**
   - Handle navigation in effects
   - Check conditions before navigation
   - Handle navigation cancellation
   - Clean up pending navigation
   ```typescript
   useEffect(() => {
     if (!isMounted) return
     
     if (shouldNavigate) {
       router.push(path)
     }

     return () => {
       // Clean up any pending navigation
     }
   }, [shouldNavigate, path, router, isMounted])
   ```

## Route Protection

1. **Route Guards**
   - Implement consistent route guards
   - Handle loading states
   - Provide feedback for unauthorized access
   - Clean up on route changes
   ```typescript
   <RouteGuard
     condition={hasAccess}
     fallbackPath="/unauthorized"
     loading={<LoadingSpinner />}
   >
     {children}
   </RouteGuard>
   ```

2. **Route State**
   - Maintain route history
   - Handle back/forward navigation
   - Preserve scroll position
   - Handle route params

## Navigation Events

1. **Event Handling**
   - Handle navigation events
   - Manage navigation state
   - Handle navigation errors
   - Provide navigation feedback
   ```typescript
   useEffect(() => {
     if (!isMounted) return

     const handleRouteChange = (url: string) => {
       if (isMounted) {
         // Handle route change
       }
     }

     router.events.on('routeChangeStart', handleRouteChange)
     return () => router.events.off('routeChangeStart', handleRouteChange)
   }, [router, isMounted])
   ```

2. **Navigation Loading**
   - Show loading indicators
   - Handle slow navigation
   - Provide progress feedback
   - Handle navigation timeout

## Error Handling

1. **Navigation Errors**
   - Handle 404 errors
   - Handle network errors
   - Provide error feedback
   - Implement recovery options

2. **Error Recovery**
   - Provide fallback routes
   - Handle navigation retry
   - Maintain error history
   - Clear error state

## Best Practices

1. **Navigation State**
   - Maintain clean URLs
   - Handle query parameters
   - Preserve state during navigation
   - Clean up on route change

2. **Performance**
   - Implement route prefetching
   - Handle route transitions
   - Optimize route loading
   - Manage route cache

3. **Security**
   - Validate route parameters
   - Handle sensitive routes
   - Implement navigation guards
   - Clean up sensitive data

## Testing

1. **Route Testing**
   - Test navigation flows
   - Verify route guards
   - Check error handling
   - Test route parameters

2. **State Testing**
   - Test state preservation
   - Verify cleanup
   - Check loading states
   - Test error recovery

3. **Performance Testing**
   - Test navigation timing
   - Verify route loading
   - Check memory usage
   - Test under load 