## File Structure

1. **Core Files**
   ```
   src/
   ├── components/error/
   │   ├── error-boundary.tsx     // React error boundary
   │   ├── error-fallback.tsx     // Error display component
   │   └── error-message.tsx      // Error message component
   ├── hooks/
   │   └── use-error-handler.ts   // Error handling hook
   ├── lib/
   │   └── errors/
   │       ├── types.ts           // Error type definitions
   │       └── utils.ts           // Error handling utilities
   └── utils/
       └── error-logger.ts        // Error logging service
   ```

2. **File Responsibilities**
   - `error-boundary.tsx`: Global error catching
   - `error-fallback.tsx`: Error state UI
   - `error-message.tsx`: Error display component
   - `use-error-handler.ts`: Error handling logic
   - `types.ts`: Error type definitions
   - `utils.ts`: Error handling helpers
   - `error-logger.ts`: Error logging service

# Error Handling Guidelines

## Error Boundaries

1. **Component Error Boundaries**
   ```typescript
   class ErrorBoundary extends React.Component {
     state = { hasError: false, error: null }
     
     static getDerivedStateFromError(error) {
       return { hasError: true, error }
     }
     
     componentDidCatch(error, info) {
       console.error('Error boundary caught error:', error, info)
     }
     
     render() {
       if (this.state.hasError) {
         return <ErrorFallback error={this.state.error} />
       }
       return this.props.children
     }
   }
   ```

2. **Feature Boundaries**
   ```typescript
   // Wrap feature components
   <ErrorBoundary>
     <FeatureComponent />
   </ErrorBoundary>

   // With retry capability
   const FeatureBoundary = ({ children }) => {
     const [key, setKey] = useState(0)
     
     const handleReset = () => setKey(prev => prev + 1)
     
     return (
       <ErrorBoundary onReset={handleReset}>
         <div key={key}>{children}</div>
       </ErrorBoundary>
     )
   }
   ```

## API Errors

1. **Network Error Handling**
   ```typescript
   const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3) => {
     try {
       const response = await fetch(url, options)
       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
       return await response.json()
     } catch (error) {
       if (retries > 0) {
         await new Promise(resolve => setTimeout(resolve, 1000))
         return fetchWithRetry(url, options, retries - 1)
       }
       throw error
     }
   }
   ```

2. **Timeout Handling**
   ```typescript
   const fetchWithTimeout = async (url: string, timeout = 5000) => {
     const controller = new AbortController()
     const id = setTimeout(() => controller.abort(), timeout)

     try {
       const response = await fetch(url, { signal: controller.signal })
       clearTimeout(id)
       return await response.json()
     } catch (error) {
       clearTimeout(id)
       if (error.name === 'AbortError') {
         throw new Error('Request timed out')
       }
       throw error
     }
   }
   ```

## State Errors

1. **Async State Updates**
   ```typescript
   const useAsyncState = (asyncFn) => {
     const [state, setState] = useState({ data: null, error: null, loading: false })
     const isMounted = useRef(true)

     useEffect(() => {
       return () => {
         isMounted.current = false
       }
     }, [])

     const execute = async () => {
       if (!isMounted.current) return
       
       setState({ data: null, error: null, loading: true })
       
       try {
         const data = await asyncFn()
         if (isMounted.current) {
           setState({ data, error: null, loading: false })
         }
       } catch (error) {
         if (isMounted.current) {
           setState({ data: null, error, loading: false })
         }
       }
     }

     return [state, execute]
   }
   ```

2. **State Recovery**
   ```typescript
   const useStateWithRecovery = (initialState) => {
     const [state, setState] = useState(initialState)
     const prevState = useRef(initialState)

     const updateState = (newState) => {
       prevState.current = state
       setState(newState)
     }

     const recoverState = () => {
       setState(prevState.current)
     }

     return [state, updateState, recoverState]
   }
   ```

## User Feedback

1. **Error Messages**
   ```typescript
   const ErrorMessage = ({ error }) => {
     const message = useMemo(() => {
       if (error instanceof NetworkError) {
         return 'Connection error. Please check your internet connection.'
       }
       if (error instanceof ValidationError) {
         return 'Please check your input and try again.'
       }
       return 'An unexpected error occurred. Please try again.'
     }, [error])

     return (
       <div role="alert" className="error-message">
         {message}
       </div>
     )
   }
   ```

2. **Recovery UI**
   ```typescript
   const ErrorWithRecovery = ({ error, onRetry, onReset }) => {
     return (
       <div className="error-container">
         <ErrorMessage error={error} />
         <div className="error-actions">
           <button onClick={onRetry}>Try Again</button>
           <button onClick={onReset}>Reset</button>
         </div>
       </div>
     )
   }
   ```

## Best Practices

1. **Error Prevention**
   - Validate inputs before processing
   - Check for null/undefined values
   - Handle edge cases explicitly
   - Use TypeScript for type safety

2. **Error Recovery**
   - Implement retry mechanisms
   - Provide clear recovery paths
   - Preserve user input when possible
   - Log errors for debugging

3. **Error Reporting**
   - Log errors with context
   - Include stack traces
   - Track error frequency
   - Monitor error patterns

## Testing Error Handling

1. **Error Boundary Testing**
   ```typescript
   it('should catch rendering errors', () => {
     const ErrorComponent = () => {
       throw new Error('Test error')
     }

     const { container } = render(
       <ErrorBoundary>
         <ErrorComponent />
       </ErrorBoundary>
     )

     expect(container).toHaveTextContent('Something went wrong')
   })
   ```

2. **API Error Testing**
   ```typescript
   it('should handle network errors', async () => {
     server.use(
       rest.get('/api/data', (req, res, ctx) => {
         return res(ctx.status(500))
       })
     )

     const { result } = renderHook(() => useData())
     
     await act(async () => {
       await result.current.fetchData()
     })

     expect(result.current.error).toBeTruthy()
   })
   ```

## Common Pitfalls

1. **Avoid These Patterns**
   - Swallowing errors silently
   - Generic error messages
   - Missing error boundaries
   - Incomplete error states

2. **Instead Do This**
   - Log all errors
   - Provide specific error messages
   - Use error boundaries strategically
   - Handle all error states 