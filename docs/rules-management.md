# Rules Management Documentation

## Rule Templates

1. **Rule File Template (.mdc)**
   ```markdown
   ---
   description: Brief description of the rule's purpose
   globs: glob patterns for relevant files
   version: 1.0.0
   last_updated: YYYY-MM-DD
   ---
   # Rule Name

   ## Purpose
   Clear description of what this rule guides the AI about.

   ## Documentation Reference
   - Implementation patterns in [doc-name.md](docs/doc-name.md)
   - ALWAYS refer to documentation before changes

   ## When to Apply
   1. **Pattern Category**
      - When to use case 1
      - When to use case 2
      - When to use case 3
      - When to use case 4
      → See doc-name.md#section

   ## Change Management Process
   1. **Before Changes**
      ```
      1. Review steps
      2. Verification steps
      3. Preparation steps
      4. Dependency checks
      ```

   ## Documentation Rules
   1. **When to Update**
      ```
      ONLY update when:
      1. Specific conditions
      2. User requirements
      3. Verification steps
      4. Approval process
      ```

   ## Related Rules
   - Related rule references
   ```

2. **Documentation Template (.md)**
   ```markdown
   # Feature Documentation

   ## Implementation Patterns
   1. **Pattern Name**
      ```typescript
      // Code example
      ```

   ## Best Practices
   1. **Category**
      - Best practice 1
      - Best practice 2

   ## Testing Guidelines
   1. **Test Category**
      ```typescript
      // Test example
      ```

   ## Common Pitfalls
   1. **What to Avoid**
      - Pitfall 1
      - Pitfall 2
   ```

## Verification Process

1. **Rule Structure Verification**
   ```typescript
   function verifyRuleStructure(rulePath: string): VerificationResult {
     const required = [
       'description',
       'globs',
       'Purpose',
       'Documentation Reference',
       'When to Apply',
       'Change Management Process',
       'Documentation Rules'
     ]
     
     // Implementation details
     return {
       isValid: boolean,
       missingElements: string[],
       recommendations: string[]
     }
   }
   ```

2. **Documentation Verification**
   ```typescript
   function verifyDocumentation(docPath: string): VerificationResult {
     const required = [
       'Implementation Patterns',
       'Best Practices',
       'Testing Guidelines',
       'Common Pitfalls'
     ]
     
     // Implementation details
     return {
       isValid: boolean,
       missingElements: string[],
       recommendations: string[]
     }
   }
   ```

3. **Code Alignment Check**
   ```typescript
   function checkCodeAlignment(
     rulePath: string,
     docPath: string,
     codebase: string
   ): AlignmentResult {
     // 1. Extract patterns from documentation
     const patterns = extractPatterns(docPath)
     
     // 2. Search codebase for implementations
     const implementations = searchCodebase(codebase, patterns)
     
     // 3. Compare and validate
     return {
       isAligned: boolean,
       mismatches: Mismatch[],
       recommendations: string[]
     }
   }
   ```

## Response Formats

1. **Alignment Report**
   ```typescript
   interface AlignmentReport {
     ruleStatus: {
       exists: boolean
       path?: string
       isValid: boolean
       issues?: string[]
     }
     documentationStatus: {
       exists: boolean
       path?: string
       isValid: boolean
       issues?: string[]
     }
     codeStatus: {
       implementationFound: boolean
       isAligned: boolean
       issues?: string[]
     }
     recommendations: string[]
   }
   ```

2. **Creation Report**
   ```typescript
   interface CreationReport {
     ruleCreated: {
       path: string
       sections: string[]
     }
     documentationCreated: {
       path: string
       sections: string[]
     }
     nextSteps: string[]
     reviewPoints: string[]
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

## Common Pitfalls

1. **Rule Creation**
   - Mixing implementation details in rules
   - Skipping documentation creation
   - Missing cross-references
   - Incomplete sections

2. **Documentation**
   - Missing code examples
   - Unclear implementation patterns
   - Incomplete testing guidelines
   - Missing error cases

3. **Verification**
   - Incomplete checks
   - Missing alignment verification
   - Skipping code search
   - Insufficient recommendations 