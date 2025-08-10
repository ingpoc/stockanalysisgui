// SECURITY: This component has been disabled
// Program initialization should not be accessible from the frontend
// This prevents unauthorized initialization and maintains security
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InitializeProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InitializeProgramDialog({
  open,
  onOpenChange,
}: InitializeProgramDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Program Initialization Disabled</DialogTitle>
          <DialogDescription>
            For security reasons, program initialization has been moved to backend services.
            Frontend access to initialization functions has been disabled to prevent unauthorized initialization.
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 text-center'>
            <div className='text-amber-600 font-medium'>
              🔒 Security Enhancement
            </div>
            <div className='text-amber-700 mt-2 text-sm'>
              Program initialization is now handled through secure backend services only.
              This prevents unauthorized initialization and maintains system security.
            </div>
          </div>
          <DialogFooter className='mt-4'>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
