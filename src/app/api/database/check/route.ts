import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

// Update the API endpoint to use the new database utilities
export async function GET() {
  try {
    // Use the new API endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const command = `curl -X GET "${apiUrl}/database/check"`
    console.log(`Executing command: ${command}`)
    
    // Execute the API call
    const { stdout, stderr } = await execPromise(command)
    
    // Log both stdout and stderr for debugging
    console.log('API response:', stdout)
    if (stderr) {
      console.log('API stderr (might not be an error):', stderr)
    }
    
    // Parse the JSON response
    try {
      const response = JSON.parse(stdout)
      
      // Always return a 200 status, even if there are validation errors
      // This allows the frontend to display the validation results
      return NextResponse.json({ 
        success: true, 
        message: response.success 
          ? 'Database check completed successfully' 
          : `Database check found ${response.errors} errors and ${response.warnings} warnings`,
        documentCount: response.documentCount || 0,
        quarters: response.quarters || [],
        errors: response.errors || 0,
        warnings: response.warnings || 0,
        details: response.details || {},
        hasIssues: !response.success
      })
    } catch (parseError) {
      console.error('Error parsing API response:', parseError)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to parse API response',
        stdout,
        stderr
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error executing database check API call:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
} 