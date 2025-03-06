import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execPromise = promisify(exec)

// Get the path to the backend directory from environment variable or fallback to default
const BACKEND_PATH = process.env.BACKEND_PATH || path.join(process.cwd(), '..', 'StockAnalysis')
console.log('Backend path:', BACKEND_PATH)

// Validate that the backend directory exists
const backendDirExists = fs.existsSync(BACKEND_PATH)

// Update the API endpoint to use the new database utilities
export async function POST() {
  try {
    // Check if the backend directory exists
    if (!backendDirExists) {
      console.error(`Backend directory not found: ${BACKEND_PATH}`)
      return NextResponse.json({ 
        success: false, 
        message: `Backend directory not found. Expected at: ${BACKEND_PATH}. Please set BACKEND_PATH environment variable.`
      }, { status: 500 })
    }

    // Path to Python executable - use 'python3' if available
    let pythonCommand = 'python'
    try {
      await execPromise('python3 --version')
      pythonCommand = 'python3'
      console.log('Using python3 command')
    } catch (e) {
      console.log('Using python command (python3 not available)')
    }

    // Use the new API endpoint instead of the script
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const command = `curl -X POST "${apiUrl}/database/backup"`
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
      
      if (response.success === false) {
        return NextResponse.json({ 
          success: false, 
          message: response.detail || 'Backup failed',
          response
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database backup completed successfully',
        backupFile: response.backup_file || response.filename, 
        response
      })
    } catch (parseError) {
      console.error('Error parsing API response:', parseError)
      
      // If we can't parse the response, check for success markers in the raw output
      const successMarker = stdout.includes('success') || 
                            stdout.includes('backup_file') ||
                            stdout.includes('filename')
      
      if (!successMarker) {
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to parse API response and no success markers found',
          stdout,
          stderr
        }, { status: 500 })
      }
      
      // Extract the backup file path from the output if possible
      const backupFileMatch = stdout.match(/"backup_file":\s*"([^"]+)"/) || 
                             stdout.match(/"filename":\s*"([^"]+)"/)
      
      const backupFile = backupFileMatch ? backupFileMatch[1] : 'Backup completed but file path not detected in output'
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database backup completed successfully',
        backupFile: backupFile, 
        output: stdout
      })
    }
  } catch (error) {
    console.error('Error executing backup API call:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
} 