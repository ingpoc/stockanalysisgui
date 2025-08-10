// SECURITY: This component has been disabled
// Game lifecycle processing should not be accessible from the frontend
// This prevents unauthorized game state manipulation and maintains security
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ProcessStuckGames() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Game Lifecycle Management Disabled</CardTitle>
        <CardDescription>
          For security reasons, game lifecycle processing has been moved to backend services.
          Frontend access to lifecycle management has been disabled to prevent unauthorized state manipulation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="py-8">
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-6 text-center'>
            <div className='text-amber-600 font-medium text-lg mb-2'>
              🔒 Security Enhancement
            </div>
            <div className='text-amber-700 text-sm mb-4'>
              Game lifecycle management and stuck game processing is now handled through secure backend services only.
              This prevents unauthorized game state manipulation and maintains system security.
            </div>
            <div className='text-amber-600 text-xs'>
              Backend automation services handle:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Game state transitions (Open → Expired)</li>
                <li>Stuck game processing</li>
                <li>Automated lifecycle management</li>
                <li>Winning number generation</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}