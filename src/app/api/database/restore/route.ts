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
const scriptPath = path.join(BACKEND_PATH, 'tools', 'reset_database.py')
const scriptExists = fs.existsSync(scriptPath)

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

    // Check if the script exists
    if (!scriptExists) {
      console.error(`Restore script not found: ${scriptPath}`)
      return NextResponse.json({ 
        success: false, 
        message: `Restore script not found. Expected at: ${scriptPath}`
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

    const command = `cd "${BACKEND_PATH}" && ${pythonCommand} tools/reset_database.py`
    console.log(`Executing command: ${command}`)
    
    // Execute the restore script
    const { stdout, stderr } = await execPromise(command)
    
    // Log both stdout and stderr for debugging
    console.log('Script stdout:', stdout)
    if (stderr) {
      console.log('Script stderr (might not be an error):', stderr)
    }
    
    // Check for specific success marker
    const successMarker = stdout.includes('SCRIPT_SUCCESS') || 
                          stdout.includes('RESET_COMPLETED') ||
                          stdout.includes('RESTORE_COMPLETED') ||
                          stdout.includes('Database reset process completed successfully') || 
                          stdout.includes('All database operations completed successfully')
    
    if (!successMarker) {
      console.error('Database restoration did not complete successfully - no success marker found in output')
      
      // Look for specific error markers
      const errorMatch = stdout.match(/SCRIPT_FAILURE: (.+)/) || 
                         stdout.match(/ERROR: (.+)/) ||
                         stdout.match(/SCRIPT_ERROR: (.+)/)
      const errorMessage = errorMatch 
        ? errorMatch[1] 
        : 'Database restoration did not complete successfully - no success marker found'
      
      return NextResponse.json({ 
        success: false, 
        message: errorMessage,
        stdout,
        stderr
      }, { status: 500 })
    }
    
    // Try to extract information about what was restored
    const restoredCountMatch = stdout.match(/INFO: Restoration complete: (\d+) documents restored/) ||
                              stdout.match(/Restoration complete: (\d+) documents restored/)
    
    const restoredCount = restoredCountMatch ? parseInt(restoredCountMatch[1]) : 0
    
    const backupFileMatch = stdout.match(/INFO: Using latest backup file: (.+)/) ||
                           stdout.match(/Latest backup file: (.+)/)
    
    const backupFile = backupFileMatch ? backupFileMatch[1] : 'unknown backup file'
    
    return NextResponse.json({ 
      success: true, 
      message: `Database restored successfully from ${backupFile}. ${restoredCount} documents restored.`,
      restoreCount: restoredCount,
      backupFile: backupFile,
      output: stdout
    })
  } catch (error) {
    console.error('Error executing restore script:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
} 