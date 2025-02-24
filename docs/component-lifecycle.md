# Component Lifecycle Guidelines

## Related Documentation
- For authentication-specific lifecycle: See [authentication.md](authentication.md)
- For data fetching patterns: See [data-management.md](data-management.md)
- For navigation handling: See [navigation.md](navigation.md)
- For notification patterns: See [notifications.md](notifications.md)

## Core Lifecycle Patterns

1. **Component Mounting**
   - Always use `isMounted` state for hydration safety
   - Initialize mount state in useEffect with cleanup
   - Don't render until mounted
   - Check mount state before updates
   ```typescript
   const [isMounted, setIsMounted] = useState(false)
   
   useEffect(() => {
     setIsMounted(true)
     return () => setIsMounted(false)
   }, [])

   if (!isMounted) return null
   ```

2. **State Management**
   - Use mount-aware state updates
   - Implement proper cleanup
   - Handle async state updates
   - Prevent memory leaks
   ```typescript
   const updateState = useCallback((newValue) => {
     if (!isMounted) return
     setState(newValue)
   }, [isMounted])

   useEffect(() => {
     return () => {
       if (isMounted) {
         setState(initialState) // Cleanup
       }
     }
   }, [isMounted])
   ```

3. **Effect Handling**
   - Add cleanup functions to all effects
   - Cancel pending operations
   - Handle async effects properly
   - Check mount state in effects
   ```typescript
   useEffect(() => {
     if (!isMounted) return

     const controller = new AbortController()
     
     async function fetchData() {
       try {
         const response = await fetch(url, { signal: controller.signal })
         if (isMounted) {
           setData(await response.json())
         }
       } catch (error) {
         if (!controller.signal.aborted && isMounted) {
           setError(error)
         }
       }
     }

     fetchData()

     return () => {
       controller.abort()
     }
   }, [url, isMounted])
   ```

## Performance Optimization

1. **Memoization**
   - Memoize expensive calculations
   - Use useMemo for complex objects
   - Memoize callbacks with useCallback
   - Optimize re-renders
   ```typescript
   const memoizedValue = useMemo(() => 
     computeExpensiveValue(prop), [prop]
   )

   const memoizedCallback = useCallback(() => {
     if (isMounted) {
       doSomething(prop)
     }
   }, [prop, isMounted])
   ```

2. **Render Optimization**
   - Implement shouldComponentUpdate logic
   - Use React.memo for function components
   - Optimize lists with proper keys
   - Avoid unnecessary re-renders
   ```typescript
   const MemoizedComponent = React.memo(({ prop }) => {
     // Component logic
   }, (prevProps, nextProps) => {
     // Return true if props are equal (skip re-render)
     return prevProps.prop === nextProps.prop
   })
   ```

## Resource Management

1. **Cleanup Patterns**
   - Clean up subscriptions (see [data-management.md](data-management.md) for subscription patterns)
   - Release resources
   - Reset state when needed
   - Handle unmount properly
   ```typescript
   useEffect(() => {
     const subscription = subscribe()
     
     return () => {
       if (isMounted) {
         subscription.unsubscribe()
         cleanup()
       }
     }
   }, [isMounted])
   ```

2. **Error Boundaries**
   - Implement component-level boundaries
   - Handle errors gracefully (see [notifications.md](notifications.md) for error notifications)
   - Provide fallback UI
   - Reset error state
   ```typescript
   class ComponentErrorBoundary extends React.Component {
     state = { hasError: false }

     static getDerivedStateFromError(error) {
       return { hasError: true }
     }

     componentDidCatch(error, errorInfo) {
       logError(error, errorInfo)
     }

     render() {
       if (this.state.hasError) {
         return <FallbackUI />
       }
       return this.props.children
     }
   }
   ```

## Loading States

1. **Loading Management**
   - Handle initial loading
   - Show loading indicators
   - Handle loading errors (see [notifications.md](notifications.md) for error handling)
   - Clean up loading state
   ```typescript
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)

   useEffect(() => {
     if (!isMounted) return

     setLoading(true)
     setError(null)

     loadData()
       .then(data => {
         if (isMounted) {
           setData(data)
         }
       })
       .catch(err => {
         if (isMounted) {
           setError(err)
         }
       })
       .finally(() => {
         if (isMounted) {
           setLoading(false)
         }
       })

     return () => {
       // Cleanup if needed
     }
   }, [isMounted])
   ```

## Testing Guidelines

1. **Lifecycle Testing**
   - Test mount/unmount cycles
   - Verify cleanup functions
   - Test effect behavior
   - Check error handling

2. **State Testing**
   - Test state updates
   - Verify cleanup
   - Test async operations (see [data-management.md](data-management.md) for data operation patterns)
   - Check error states

3. **Performance Testing**
   - Test memoization
   - Verify render optimization
   - Check resource cleanup
   - Test memory usage

## Note
This document focuses on general component lifecycle patterns. For feature-specific implementations:
- Authentication flows: See [authentication.md](authentication.md)
- Data and subscription handling: See [data-management.md](data-management.md)
- Navigation patterns: See [navigation.md](navigation.md)
- Notification system: See [notifications.md](notifications.md)
- Lottery system: See [lottery.md](lottery.md) 