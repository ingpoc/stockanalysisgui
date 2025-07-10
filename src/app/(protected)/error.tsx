'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ProtectedErrorProps {
  error: Error;
  reset: () => void;
}

export default function ProtectedError({ error, reset }: ProtectedErrorProps) {
  useEffect(() => {
    // Error is already handled by Next.js error boundary
  }, [error]);

  return (
    <div className='flex flex-col items-center justify-center h-screen p-4'>
      <h1 className='text-2xl font-semibold'>Something went wrong</h1>
      <p className='mt-2 text-muted-foreground'>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button onClick={() => reset()} className='mt-4'>
        Retry
      </Button>
    </div>
  );
}
