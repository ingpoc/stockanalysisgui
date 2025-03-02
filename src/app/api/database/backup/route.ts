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
const scriptPath = path.join(BACKEND_PATH, 'tools', 'backup_database.py')
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
      console.error(`Backup script not found: ${scriptPath}`)
      return NextResponse.json({ 
        success: false, 
        message: `Backup script not found. Expected at: ${scriptPath}`
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

    const command = `cd "${BACKEND_PATH}" && ${pythonCommand} tools/backup_database.py`
    console.log(`Executing command: ${command}`)
    
    // Execute the backup script
    const { stdout, stderr } = await execPromise(command)
    
    // Log both stdout and stderr for debugging
    console.log('Script stdout:', stdout)
    if (stderr) {
      console.log('Script stderr (might not be an error):', stderr)
    }
    
    // Check for specific success marker
    const successMarker = stdout.includes('SCRIPT_SUCCESS') || 
                          stdout.includes('BACKUP_COMPLETED')
    
    if (!successMarker) {
      console.error('Backup was not successful - no success marker found in output')
      // Look for specific error markers
      const errorMatch = stdout.match(/SCRIPT_FAILURE: (.+)/) || 
                         stdout.match(/ERROR: (.+)/)
      const errorMessage = errorMatch ? errorMatch[1] : 'Backup failed - no success marker found'
      
      return NextResponse.json({ 
        success: false, 
        message: errorMessage,
        stdout,
        stderr
      }, { status: 500 })
    }
    
    // Extract the backup file path from the output
    const backupFileMatch = stdout.match(/SCRIPT_SUCCESS: Backup created successfully at (.+)/) || 
                           stdout.match(/Saving backup to (.+\.json)/) || 
                           stdout.match(/Backup completed successfully to (.+\.json)/)
    
    let backupFile = null
    if (backupFileMatch) {
      backupFile = backupFileMatch[1]
    } else {
      // If we can't find the exact path, extract just the filename from a directory listing
      const directoryMatch = stdout.match(/db_backups\/detailed_financials_backup_[0-9_]+\.json/)
      if (directoryMatch) {
        backupFile = directoryMatch[0]
      } else {
        backupFile = "Backup completed but file path not detected in output"
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database backup completed successfully',
      backupFile: backupFile, 
      output: stdout
    })
  } catch (error) {
    console.error('Error executing backup script:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
} 