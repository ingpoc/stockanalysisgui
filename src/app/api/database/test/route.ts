import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execPromise = promisify(exec)

// Get the path to the backend directory from environment variable or fallback to default
const BACKEND_PATH = process.env.BACKEND_PATH || path.join(process.cwd(), '..', 'StockAnalysis')

interface DebugInfo {
  backend_path: string;
  backend_exists: boolean;
  tools_path: string;
  tools_exists: boolean;
  scripts: {
    backup: {
      path: string;
      exists: boolean;
    };
    check: {
      path: string;
      exists: boolean;
    };
    reset: {
      path: string;
      exists: boolean;
    };
  };
  env: {
    NODE_ENV: string | undefined;
    BACKEND_PATH: string | undefined;
    cwd: string;
    parent_dir: string;
  };
  python?: {
    version: string | null;
    error: string | null;
  };
  python3?: {
    version: string | null;
    error: string | null;
  };
  backups?: {
    dir: string;
    exists: boolean;
    files?: string[];
    latest?: string | null;
    error?: string;
  };
}

export async function GET() {
  try {
    // Collect debug information
    const debug: DebugInfo = {
      backend_path: BACKEND_PATH,
      backend_exists: fs.existsSync(BACKEND_PATH),
      tools_path: path.join(BACKEND_PATH, 'tools'),
      tools_exists: fs.existsSync(path.join(BACKEND_PATH, 'tools')),
      scripts: {
        backup: {
          path: path.join(BACKEND_PATH, 'tools', 'backup_database.py'),
          exists: fs.existsSync(path.join(BACKEND_PATH, 'tools', 'backup_database.py'))
        },
        check: {
          path: path.join(BACKEND_PATH, 'tools', 'check_database.py'),
          exists: fs.existsSync(path.join(BACKEND_PATH, 'tools', 'check_database.py'))
        },
        reset: {
          path: path.join(BACKEND_PATH, 'tools', 'reset_database.py'),
          exists: fs.existsSync(path.join(BACKEND_PATH, 'tools', 'reset_database.py'))
        }
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        BACKEND_PATH: process.env.BACKEND_PATH,
        cwd: process.cwd(),
        parent_dir: path.dirname(process.cwd())
      }
    }
    
    // Try Python commands
    try {
      const pythonResult = await execPromise('python --version')
      debug.python = {
        version: pythonResult.stdout.trim() || pythonResult.stderr.trim(),
        error: null
      }
    } catch (e) {
      debug.python = {
        version: null,
        error: e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    try {
      const python3Result = await execPromise('python3 --version')
      debug.python3 = {
        version: python3Result.stdout.trim() || python3Result.stderr.trim(),
        error: null
      }
    } catch (e) {
      debug.python3 = {
        version: null,
        error: e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    // List backup files
    const backupDir = path.join(BACKEND_PATH, 'db_backups')
    if (fs.existsSync(backupDir)) {
      try {
        const files = fs.readdirSync(backupDir)
          .filter(file => file.startsWith('detailed_financials_backup_') && file.endsWith('.json'))
          .sort()
          .reverse()
        
        debug.backups = {
          dir: backupDir,
          exists: true,
          files: files,
          latest: files.length > 0 ? files[0] : null
        }
      } catch (e) {
        debug.backups = {
          dir: backupDir,
          exists: true,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    } else {
      debug.backups = {
        dir: backupDir,
        exists: false
      }
    }
    
    return NextResponse.json({ 
      success: true,
      debug
    })
  } catch (error) {
    console.error('Error in debug route:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
} 