"use client"

import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  AlertCircle, 
  AlertTriangle, 
  Check, 
  Database, 
  Download, 
  FileUp, 
  Loader2, 
  Search 
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

type ActionStatus = 'idle' | 'loading' | 'success' | 'error'

interface ActionState {
  backup: ActionStatus
  restore: ActionStatus
  check: ActionStatus
}

interface DatabaseInfo {
  documentCount: number
  correctFormatCount: number
  oldFormatCount: number
  quarters: string[]
  sampleDocument?: any
}

export default function DatabaseManagementSettings() {
  const [status, setStatus] = useState<ActionState>({
    backup: 'idle',
    restore: 'idle',
    check: 'idle'
  })
  const [lastBackupFile, setLastBackupFile] = useState<string | null>(null)
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null)
  
  // Perform database backup
  const handleBackup = async () => {
    try {
      setStatus(prev => ({ ...prev, backup: 'loading' }))
      const response = await fetch('/api/database/backup', {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to backup database')
      }
      
      const data = await response.json()
      setLastBackupFile(data.backupFile)
      setStatus(prev => ({ ...prev, backup: 'success' }))
      toast.success('Database backup completed successfully')
    } catch (error) {
      console.error('Error backing up database:', error)
      setStatus(prev => ({ ...prev, backup: 'error' }))
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to backup database'}`)
    }
  }
  
  // Restore database from backup
  const handleRestore = async () => {
    if (!confirm('This will replace your current database with the backup. Are you sure you want to continue?')) {
      return
    }
    
    try {
      setStatus(prev => ({ ...prev, restore: 'loading' }))
      const response = await fetch('/api/database/restore', {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to restore database')
      }
      
      setStatus(prev => ({ ...prev, restore: 'success' }))
      toast.success('Database restored successfully')
    } catch (error) {
      console.error('Error restoring database:', error)
      setStatus(prev => ({ ...prev, restore: 'error' }))
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to restore database'}`)
    }
  }
  
  // Check database structure
  const handleCheck = async () => {
    try {
      setStatus(prev => ({ ...prev, check: 'loading' }))
      setDbInfo(null)
      
      const response = await fetch('/api/database/check')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to check database')
      }
      
      const data = await response.json()
      setDbInfo(data)
      setStatus(prev => ({ ...prev, check: 'success' }))
    } catch (error) {
      console.error('Error checking database:', error)
      setStatus(prev => ({ ...prev, check: 'error' }))
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to check database'}`)
    }
  }
  
  // Reset status for a specific action
  const resetStatus = (action: keyof ActionState) => {
    setStatus(prev => ({ ...prev, [action]: 'idle' }))
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backup Database Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Backup Database
            </CardTitle>
            <CardDescription>
              Create a backup of the current database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This will create a JSON backup file of your detailed_financials collection.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleBackup} 
              disabled={status.backup === 'loading'}
              className="w-full"
            >
              {status.backup === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Backing up...
                </>
              ) : status.backup === 'success' ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Backup Complete
                </>
              ) : (
                'Backup Database'
              )}
            </Button>
          </CardFooter>
          {lastBackupFile && status.backup === 'success' && (
            <div className="px-6 pb-4">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Backup created</AlertTitle>
                <AlertDescription className="text-xs truncate">
                  {lastBackupFile}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
        
        {/* Restore Database Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <FileUp className="mr-2 h-5 w-5" />
              Restore Database
            </CardTitle>
            <CardDescription>
              Restore the database from a backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This will replace your current database with the latest backup file. This action cannot be undone.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleRestore} 
              disabled={status.restore === 'loading'}
              variant="destructive"
              className="w-full"
            >
              {status.restore === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : status.restore === 'success' ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Restore Complete
                </>
              ) : (
                'Restore Database'
              )}
            </Button>
          </CardFooter>
          {status.restore === 'success' && (
            <div className="px-6 pb-4">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Restore completed</AlertTitle>
                <AlertDescription>
                  Database has been restored successfully.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
        
        {/* Check Database Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Check Database
            </CardTitle>
            <CardDescription>
              Check the database structure and contents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This will analyze your database structure and provide information about its contents.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCheck} 
              disabled={status.check === 'loading'}
              variant="outline"
              className="w-full"
            >
              {status.check === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Database'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Database Information */}
      {dbInfo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Information
            </CardTitle>
            <CardDescription>
              Current state of your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-md p-3">
                  <div className="text-sm font-medium">Total Documents</div>
                  <div className="text-2xl font-bold">{dbInfo.documentCount}</div>
                </div>
                <div className="bg-muted rounded-md p-3">
                  <div className="text-sm font-medium">Documents with Correct Format</div>
                  <div className="text-2xl font-bold">{dbInfo.correctFormatCount}</div>
                </div>
                <div className="bg-muted rounded-md p-3">
                  <div className="text-sm font-medium">Documents with Old Format</div>
                  <div className="text-2xl font-bold">{dbInfo.oldFormatCount}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Available Quarters</h4>
                <div className="flex flex-wrap gap-2">
                  {dbInfo.quarters.map(quarter => (
                    <div key={quarter} className="bg-muted text-xs px-2 py-1 rounded-md">
                      {quarter}
                    </div>
                  ))}
                </div>
              </div>
              
              {dbInfo.oldFormatCount > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Format Issues Detected</AlertTitle>
                  <AlertDescription>
                    {dbInfo.oldFormatCount} documents have the old format structure. Consider running database fix.
                  </AlertDescription>
                </Alert>
              )}
              
              {dbInfo.correctFormatCount === dbInfo.documentCount && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Database Structure is Healthy</AlertTitle>
                  <AlertDescription>
                    All documents have the correct structure.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error States */}
      {status.backup === 'error' && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backup Failed</AlertTitle>
          <AlertDescription>
            There was a problem backing up the database. Check the console for more details.
            <Button variant="outline" size="sm" onClick={() => resetStatus('backup')} className="mt-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status.restore === 'error' && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Restore Failed</AlertTitle>
          <AlertDescription>
            There was a problem restoring the database. Check the console for more details.
            <Button variant="outline" size="sm" onClick={() => resetStatus('restore')} className="mt-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status.check === 'error' && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Check Failed</AlertTitle>
          <AlertDescription>
            There was a problem checking the database. Check the console for more details.
            <Button variant="outline" size="sm" onClick={() => resetStatus('check')} className="mt-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 