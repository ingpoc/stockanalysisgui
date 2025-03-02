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
const scriptPath = path.join(BACKEND_PATH, 'tools', 'check_database.py')
const scriptExists = fs.existsSync(scriptPath)

export async function GET() {
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
      console.error(`Check script not found: ${scriptPath}`)
      return NextResponse.json({ 
        success: false, 
        message: `Check script not found. Expected at: ${scriptPath}`
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

    const command = `cd "${BACKEND_PATH}" && ${pythonCommand} tools/check_database.py`
    console.log(`Executing command: ${command}`)
    
    // Execute the check database script
    const { stdout, stderr } = await execPromise(command)
    
    // Log both stdout and stderr for debugging
    console.log('Script stdout:', stdout)
    if (stderr) {
      console.log('Script stderr (might not be an error):', stderr)
    }
    
    // Check for specific success marker
    const successMarker = stdout.includes('SCRIPT_SUCCESS') || 
                          stdout.includes('CHECK_COMPLETED')
    
    if (!successMarker) {
      console.error('Database check was not successful - no success marker found in output')
      // Look for specific error markers
      const errorMatch = stdout.match(/SCRIPT_FAILURE: (.+)/) || 
                         stdout.match(/ERROR: (.+)/)
      const errorMessage = errorMatch ? errorMatch[1] : 'Database check failed - no success marker found'
      
      return NextResponse.json({ 
        success: false, 
        message: errorMessage,
        stdout,
        stderr
      }, { status: 500 })
    }
    
    // Parse the output to extract information - looking for INFO: prefixes
    const documentCountMatch = stdout.match(/INFO: Found (\d+) documents in detailed_financials collection/) || 
                              stdout.match(/Found (\d+) documents in detailed_financials collection/)
                              
    const correctFormatMatch = stdout.match(/INFO: Documents with correct format \(financial_metrics array\): (\d+)/) || 
                              stdout.match(/Documents with correct format \(financial_metrics array\): (\d+)/)
                              
    const oldFormatMatch = stdout.match(/INFO: Documents with old format \(financial_data field\): (\d+)/) ||
                          stdout.match(/Documents with old format \(financial_data field\): (\d+)/)
    
    const quartersMatch = stdout.match(/INFO: Found (\d+) unique quarters in the database:/) ||
                         stdout.match(/Found (\d+) unique quarters in the database:/)
                         
    const quartersList: string[] = []
    
    // Extract quarters list - with INFO: prefix or without
    if (quartersMatch) {
      const quarterLines = stdout.match(/INFO:   - ([Q\d].+)/g) || 
                          stdout.match(/  - ([Q\d].+)/g)
      if (quarterLines) {
        quartersList.push(...quarterLines.map(line => {
          // Handle both INFO: prefix and traditional format
          if (line.includes('INFO:')) {
            return line.replace(/INFO:   - /, '').trim()
          } else {
            return line.replace(/  - /, '').trim()
          }
        }))
      }
    }
    
    return NextResponse.json({ 
      success: true,
      documentCount: documentCountMatch ? parseInt(documentCountMatch[1]) : 0,
      correctFormatCount: correctFormatMatch ? parseInt(correctFormatMatch[1]) : 0,
      oldFormatCount: oldFormatMatch ? parseInt(oldFormatMatch[1]) : 0,
      quarters: quartersList,
      rawOutput: stdout
    })
  } catch (error) {
    console.error('Error executing check database script:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
} 