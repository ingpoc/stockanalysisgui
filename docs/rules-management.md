# Rules Management Documentation

## File Structure

1. **Core Files**
   ```
   .cursor/
   └── rules/
       ├── rules-management-rule.mdc    // Rules management guidelines
       ├── component-lifecycle-rule.mdc  // Component lifecycle rules
       └── other-feature-rules.mdc      // Other feature rules
   docs/
   ├── rules-management.md             // Rules management docs
   ├── component-lifecycle.md          // Component lifecycle docs
   └── other-feature.md               // Other feature docs
   ```

2. **File Responsibilities**
   - `rules-management-rule.mdc`: Define rules for managing rules
   - `rules-management.md`: Implementation details for rules
   - Each feature rule: Define patterns for specific feature
   - Each feature doc: Implementation details for feature

## Rule Creation Process

1. **Rule Template**
   ```markdown
   ---
   description: Brief description
   globs: file patterns
   version: 1.0.0
   last_updated: YYYY-MM-DD
   ---
   # Rule Name

   ## Purpose
   Clear description of rule's purpose

   ## Documentation Reference
   - Implementation in [doc-name.md](docs/doc-name.md)
   - ALWAYS check documentation first

   ## File Structure
   1. **Core Files**
      ```
      Directory structure
      ```
   2. **File Responsibilities**
      - File descriptions

   ## When to Apply
   1. **Category**
      - Use cases
      → See doc-name.md#section

   ## Change Management Process
   1. **Before Changes**
      ```
      Steps to follow
      ```

   ## Documentation Rules
   1. **Requirements**
      ```
      Required elements
      ```

   ## Related Rules
   - Cross-references
   ```

2. **Documentation Template**
   ```markdown
   # Feature Documentation

   ## File Structure
   1. **Core Files**
      ```
      Directory structure
      ```

   ## Implementation Patterns
   1. **Pattern Category**
      ```typescript
      // Code example
      ```

   ## Best Practices
   1. **Category**
      - Best practice items

   ## Testing Guidelines
   1. **Test Category**
      ```typescript
      // Test example
      ```

   ## Common Pitfalls
   1. **What to Avoid**
      - Pitfall descriptions
   ```

## Verification Process

1. **Rule Verification**
   ```typescript
   interface RuleVerification {
     ruleExists: boolean
     hasDocumentation: boolean
     isValid: boolean
     issues: string[]
     recommendations: string[]
   }

   function verifyRule(rulePath: string): RuleVerification {
     // 1. Check file existence
     // 2. Validate structure
     // 3. Check documentation
     // 4. Return verification result
   }
   ```

2. **Documentation Verification**
   ```typescript
   interface DocVerification {
     exists: boolean
     hasFileStructure: boolean
     hasPatterns: boolean
     hasTests: boolean
     issues: string[]
   }

   function verifyDocumentation(docPath: string): DocVerification {
     // 1. Check file existence
     // 2. Validate sections
     // 3. Check code examples
     // 4. Return verification result
   }
   ```

## Best Practices

1. **Rule Management**
   - Keep rules focused and specific
   - Maintain clear separation of concerns
   - Use consistent formatting
   - Update version numbers

2. **Documentation Management**
   - Keep implementation details in docs
   - Use clear code examples
   - Include common pitfalls
   - Maintain cross-references

3. **Verification Process**
   - Check all required sections
   - Verify code examples
   - Validate cross-references
   - Test code alignment

## Testing Guidelines

1. **Rule Testing**
   ```typescript
   describe('Rule Verification', () => {
     it('should validate rule structure', () => {
       const result = verifyRule('example-rule.mdc')
       expect(result.isValid).toBe(true)
       expect(result.issues).toHaveLength(0)
     })
   })
   ```

2. **Documentation Testing**
   ```typescript
   describe('Documentation Verification', () => {
     it('should validate documentation structure', () => {
       const result = verifyDocumentation('example.md')
       expect(result.hasFileStructure).toBe(true)
       expect(result.hasPatterns).toBe(true)
     })
   })
   ```

## Common Pitfalls

1. **Rule Creation**
   - Mixing implementation details in rules
   - Missing documentation reference
   - Incomplete sections
   - Unclear use cases

2. **Documentation**
   - Missing file structure
   - Unclear examples
   - Incomplete testing guidelines
   - Missing cross-references

3. **Verification**
   - Incomplete checks
   - Missing alignment verification
   - Skipping code search
   - Insufficient recommendations 