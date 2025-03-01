## File Structure

1. **Core Files**
   ```
   src/
   ├── components/ui/
   │   ├── toast.tsx          // Toast component
   │   └── alert.tsx          // Alert component
   ├── hooks/
   │   └── use-toast.ts       // Toast management hook
   ├── lib/
   │   └── notifications/
   │       ├── provider.tsx   // Toast provider setup
   │       └── utils.ts       // Notification utilities
   └── types/
       └── toast.ts           // Notification type definitions
   ```

2. **File Responsibilities**
   - `toast.tsx`: Toast notification component
   - `alert.tsx`: Alert message component
   - `use-toast.ts`: Hook for managing notifications
   - `provider.tsx`: Global toast context provider
   - `utils.ts`: Helper functions for notifications
   - `toast.ts`: Type definitions for notifications

## Toast Provider Setup

1. **Global Configuration**
   - Use Sonner for all toast notifications
   - Configure in root layout or context provider:
   ```typescript
   import { Toaster } from 'sonner'
   
   // Place in root layout
   <Toaster 
     richColors 
     position="top-right"
     // Default duration: 3000ms
   />
   ```

2. **Import Guidelines**
   - Always import from 'sonner':
   ```typescript
   import { toast } from 'sonner'
   ```
   - Never use custom toast implementations

## Usage Patterns

1. **Success Messages**
   ```typescript
   toast.success("Action Completed", {
     description: "Detailed success message here"
   })
   ```

2. **Error Messages**
   ```typescript
   toast.error("Action Failed", {
     description: "User-friendly error message"
   })
   ```

3. **Warning Messages**
   ```typescript
   toast.warning("Warning", {
     description: "Warning message about potential issues"
   })
   ```

4. **Info Messages**
   ```typescript
   toast.info("Information", {
     description: "General information message"
   })
   ```

## Error Handling Integration

1. **Program Errors**
   - Always use handleProgramError for program-specific errors
   ```typescript
   try {
     // ... program operation
   } catch (error) {
     const errorMessage = handleProgramError(error)
     toast.error("Operation Failed", {
       description: errorMessage
     })
   }
   ```

2. **Wallet Connection Errors**
   ```typescript
   if (!connected) {
     toast.error("Wallet Not Connected", {
       description: "Please connect your wallet to continue"
     })
     return
   }
   ```

## Best Practices

1. **Message Structure**
   - Title: Short, action-oriented (success/failure)
   - Description: Detailed but concise explanation
   - Keep messages user-friendly and actionable

2. **Duration Guidelines**
   - Success messages: 3000ms (default)
   - Error messages: 5000ms (for better readability)
   - Critical errors: 7000ms

3. **Position Consistency**
   - Always use top-right position
   - Maintain consistent positioning across all pages

4. **Loading States**
   - Show loading states in UI components
   - Update toast only on completion/error
   ```typescript
   const [loading, setLoading] = useState(false)
   try {
     setLoading(true)
     await operation()
     toast.success("Success")
   } catch (error) {
     toast.error("Error")
   } finally {
     setLoading(false)
   }
   ```

## Common Scenarios

1. **Transaction Notifications**
   ```typescript
   // Starting transaction
   toast.info("Transaction Started", {
     description: "Please confirm in your wallet"
   })
   
   // Success
   toast.success("Transaction Confirmed", {
     description: "Your transaction has been confirmed"
   })
   ```

2. **Form Submissions**
   ```typescript
   // Success
   toast.success("Form Submitted", {
     description: "Your data has been saved successfully"
   })
   
   // Validation Error
   toast.error("Invalid Input", {
     description: "Please check the form for errors"
   })
   ```

3. **Lottery Operations**
   ```typescript
   // Lottery Creation
   toast.success("Lottery Created", {
     description: "New lottery has been created successfully"
   })
   
   // Ticket Purchase
   toast.success("Tickets Purchased", {
     description: `Successfully purchased ${count} tickets`
   })
   ```

## Testing Guidelines

1. **Toast Verification**
   - Verify toast appears with correct type
   - Check message content and formatting
   - Ensure proper duration and dismissal
   - Test different viewport sizes

2. **Error Scenarios**
   - Test all error conditions
   - Verify error message clarity
   - Check toast persistence for critical errors

## Accessibility

1. **Color Contrast**
   - Use richColors for proper contrast
   - Ensure text is readable on all themes

2. **Screen Readers**
   - Messages should be screen-reader friendly
   - Use proper ARIA labels where needed

## Common Pitfalls to Avoid

1. **Don't**
   - Mix different toast libraries
   - Show multiple toasts for the same action
   - Use toasts for critical application state
   - Show technical error details to users

2. **Do**
   - Keep messages concise and clear
   - Use appropriate toast types
   - Handle all error cases
   - Provide actionable information

## Implementation Changes (November 2024)

1. **Important Update: Standardized on Sonner**
   - All components now use Sonner directly
   - The custom `useToast` hook from Shadcn UI has been deprecated
   - Import patterns have been standardized:
   ```typescript
   import { toast } from 'sonner'
   ```

2. **Migration Guide**
   - Replace `useToast` hook usage:
   ```typescript
   // OLD (deprecated)
   const { toast } = useToast()
   toast({
     title: 'Success',
     description: 'Action completed',
   })
   
   // NEW
   import { toast } from 'sonner'
   toast.success('Action completed', {
     description: 'Your action was successful'
   })
   ```

3. **Standard Duration Guidelines**
   - Success: 3000ms (default)
   - Error: 5000ms
   - Critical error: 7000ms
   - Info: 3000ms
   - Warning: 4000ms
   ```typescript
   // Example with custom duration
   toast.error('Error occurred', {
     description: 'Please try again later',
     duration: 5000
   })
   ```

4. **Async Operation Pattern**
   - Use `toast.promise` for async operations:
   ```typescript
   toast.promise(
     asyncOperation(),
     {
       loading: 'Processing...',
       success: 'Operation completed successfully',
       error: 'Operation failed. Please try again.'
     }
   )
   ```

## Technical Implementation

1. **Root Configuration**
   ```tsx
   // src/context/index.tsx
   import { Toaster } from 'sonner'
   
   export default function ContextProvider({ children }) {
     return (
       <>
         {children}
         <Toaster richColors position="top-right" />
       </>
     )
   }
   ```

2. **Component Imports**
   ```tsx
   import { toast } from 'sonner'
   ```

3. **Success Example**
   ```tsx
   function handleSubmit() {
     try {
       // Process form
       toast.success('Form submitted', {
         description: 'Your data has been saved'
       })
     } catch (error) {
       toast.error('Submission failed', {
         description: error.message
       })
     }
   }
   ```

4. **Error Example**
   ```tsx
   function handleDelete(id) {
     try {
       await deleteItem(id)
       toast.success('Item deleted')
     } catch (error) {
       toast.error('Delete failed', {
         description: 'The item could not be deleted'
       })
     }
   }
   ```

5. **Promise Example**
   ```tsx
   async function handleUpload() {
     toast.promise(
       uploadFile(),
       {
         loading: 'Uploading file...',
         success: 'File uploaded successfully',
         error: 'Upload failed'
       }
     )
   }
   ```