# Data Management Guidelines

## File Structure

1. **Core Files**
   ```
   src/
   ├── hooks/
   │   ├── use-query.ts          // Data fetching hook
   │   ├── use-mutation.ts       // Data mutation hook
   │   └── use-subscription.ts   // Real-time data hook
   ├── lib/
   │   └── data/
   │       ├── cache.ts          // Data caching logic
   │       ├── fetcher.ts        // Data fetching utilities
   │       └── subscriptions.ts  // Subscription management
   ├── utils/
   │   └── data-transforms.ts    // Data transformation utils
   └── types/
       └── data.ts              // Data-related types
   ```

2. **File Responsibilities**
   - `use-query.ts`: Data fetching and caching
   - `use-mutation.ts`: Data updates and mutations
   - `use-subscription.ts`: Real-time data handling
   - `cache.ts`: Caching implementation
   - `fetcher.ts`: API interaction utilities
   - `subscriptions.ts`: Subscription logic
   - `data-transforms.ts`: Data conversion utilities
   - `data.ts`: Type definitions

## Related Documentation
- For component lifecycle patterns: See [component-lifecycle.md](component-lifecycle.md)
- For authentication state: See [authentication.md](authentication.md)
- For error notifications: See [notifications.md](notifications.md)

## Subscription Management

1. **Subscription Setup**
   - Use refs to store subscription IDs
   - Clean up subscriptions on unmount
   - Handle async subscription operations
   - Check mount state before updating subscription state
   ```typescript
   const subscriptionsRef = useRef<Map<string, number>>(new Map())
   
   const subscribe = useCallback(async (id: string, callback: Function) => {
     if (!isMounted) return
     
     try {
       const subscriptionId = await createSubscription(id, callback)
       if (isMounted) {
         subscriptionsRef.current.set(id, subscriptionId)
       }
     } catch (error) {
       console.error('Subscription failed:', error)
     }
   }, [isMounted])

   useEffect(() => {
     return () => {
       subscriptionsRef.current.forEach(id => unsubscribe(id))
       subscriptionsRef.current.clear()
     }
   }, [])
   ```

2. **Subscription Cleanup**
   - Implement proper unsubscribe logic
   - Handle cleanup errors gracefully
   - Clear subscription references
   - Check mount state during cleanup

## Data Fetching

1. **Fetch Operations**
   - Wrap fetch operations in useCallback (see [component-lifecycle.md](component-lifecycle.md) for lifecycle patterns)
   - Handle loading and error states
   - Check mount state before state updates
   - Clean up pending operations on unmount
   ```typescript
   const fetchData = useCallback(async () => {
     if (!isMounted) return
     
     const controller = new AbortController()
     
     try {
       setLoading(true)
       const data = await fetchOperation({ signal: controller.signal })
       if (isMounted) {
         setData(data)
       }
     } catch (error) {
       if (!controller.signal.aborted && isMounted) {
         setError(error)
       }
     } finally {
       if (isMounted) {
         setLoading(false)
       }
     }

     return () => controller.abort()
   }, [isMounted])
   ```

2. **Data Caching**
   - Implement appropriate caching strategies
   - Handle cache invalidation
   - Update cache safely
   - Clean up stale data

## State Management

1. **Data Updates**
   - Handle concurrent updates
   - Maintain data consistency
   - Update related data atomically
   - Handle partial updates

2. **Data Validation**
   - Validate data before updates
   - Handle validation errors (see [notifications.md](notifications.md) for error display)
   - Provide feedback for invalid data
   - Maintain validation state

## Error Handling

1. **Operation Errors**
   - Handle network errors
   - Handle timeout errors
   - Provide retry mechanisms (see [notifications.md](notifications.md) for user feedback)
   - Log errors appropriately

2. **Recovery Strategies**
   - Implement fallback data
   - Handle partial failures
   - Provide recovery options
   - Maintain system state

## Best Practices

1. **Data Operations**
   - Use appropriate data structures
   - Handle large datasets
   - Implement pagination
   - Optimize performance

2. **Subscription Patterns**
   - Handle reconnection
   - Implement backoff strategies
   - Monitor subscription health
   - Handle subscription errors

3. **Resource Management**
   - Clean up resources properly
   - Handle memory usage
   - Monitor performance
   - Implement limits

## Testing

1. **Data Operations**
   - Test fetch operations
   - Verify data updates
   - Check error handling
   - Test cleanup

2. **Subscription Testing**
   - Test subscription lifecycle
   - Verify cleanup
   - Check error handling
   - Test concurrent operations

3. **Performance Testing**
   - Test large datasets
   - Verify memory usage
   - Check response times
   - Test under load

## Note
This document focuses on data management patterns. For feature-specific implementations:
- Component lifecycle: See [component-lifecycle.md](component-lifecycle.md)
- Authentication flows: See [authentication.md](authentication.md)
- Navigation patterns: See [navigation.md](navigation.md)
- Notification system: See [notifications.md](notifications.md)
- Lottery system: See [lottery.md](lottery.md) 