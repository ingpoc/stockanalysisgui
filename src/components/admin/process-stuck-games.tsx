'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoulette } from '@/hooks/useRoulette';
import { useQuery } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import { ROULETTE_PROGRAM_ID } from '@/lib/constants';

export function ProcessStuckGames() {
  const { processGameLifecycle, roulettes } = useRoulette();
  const { connection } = useConnection();
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [processed, setProcessed] = useState<Set<string>>(new Set());

  // Query to get ALL roulette program accounts (including stuck ones)
  const { data: allRouletteAccounts, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-roulette-accounts'],
    queryFn: async () => {
      try {
        const programId = new PublicKey(ROULETTE_PROGRAM_ID);
        const accounts = await connection.getProgramAccounts(programId);
        
        // Filter for roulette accounts (they have data length > 200 bytes)
        const rouletteAccounts = accounts.filter(acc => acc.account.data.length > 200);
        
        const now = Math.floor(Date.now() / 1000);
        
        // Decode basic state info for each account
        const decodedAccounts = rouletteAccounts.map(acc => {
          try {
            const data = acc.account.data;
            const stateByte = data[81]; // State is at offset 81
            const states = ['Created', 'Open', 'Locked', 'Spinning', 'AwaitingRandomness', 'Completed', 'Expired', 'Cancelled'];
            const state = states[stateByte] || 'Unknown';
            
            // Read end time (8 bytes at offset 65)
            const endTime = Number(data.readBigInt64LE(65));
            
            return {
              address: acc.pubkey.toString(),
              state,
              stateByte,
              endTime,
              isStuck: state === 'Open' && endTime < now,
              hoursExpired: state === 'Open' && endTime < now ? Math.floor((now - endTime) / 3600) : 0
            };
          } catch (error) {
            return {
              address: acc.pubkey.toString(),
              state: 'DecodeError',
              stateByte: -1,
              endTime: 0,
              isStuck: false,
              hoursExpired: 0
            };
          }
        });
        
        console.log(`🔍 Found ${rouletteAccounts.length} total roulette accounts`);
        const stuckCount = decodedAccounts.filter(acc => acc.isStuck).length;
        console.log(`🚨 Found ${stuckCount} stuck games (Open state past end time)`);
        
        return decodedAccounts;
      } catch (error) {
        console.error('Error fetching all roulette accounts:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000,
  });

  // Filter stuck games from all accounts
  const stuckGames = allRouletteAccounts?.filter(acc => acc.isStuck) || [];
  
  // Sort by hours expired (most expired first)
  const sortedStuckGames = stuckGames.sort((a, b) => b.hoursExpired - a.hoursExpired);

  const handleProcessGame = async (gameAddress: string) => {
    setProcessing(prev => new Set(prev).add(gameAddress));
    
    try {
      await processGameLifecycle({ roulette: gameAddress });
      setProcessed(prev => new Set(prev).add(gameAddress));
      toast.success(`Game ${gameAddress.slice(0, 8)}... processed successfully!`);
    } catch (error) {
      toast.error(`Failed to process game ${gameAddress.slice(0, 8)}...`);
      console.error('Process game error:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(gameAddress);
        return newSet;
      });
    }
  };

  const handleProcessAll = async () => {
    for (const game of sortedStuckGames) {
      if (!processed.has(game.address)) {
        await handleProcessGame(game.address);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  };

  // Statistics
  const totalGameCount = allRouletteAccounts?.length || 0;
  const stuckGameCount = stuckGames.length;
  const processedGameCount = allRouletteAccounts?.filter(acc => acc.state === 'Expired' || acc.state === 'Completed').length || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Process Stuck Games</CardTitle>
        <CardDescription>
          Fix games that are stuck in &quot;Open&quot; state past their end time.
          These games need manual lifecycle processing to transition to proper terminal states.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalGameCount}</div>
            <div className="text-xs text-muted-foreground">Total Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stuckGameCount}</div>
            <div className="text-xs text-muted-foreground">Stuck Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{processedGameCount}</div>
            <div className="text-xs text-muted-foreground">Processed Games</div>
          </div>
        </div>

        {isLoadingAll && (
          <div className="text-center py-4 text-muted-foreground">
            🔍 Scanning all roulette accounts...
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Found {stuckGameCount} stuck games that need processing
            {stuckGameCount > 0 && ` (${Math.max(...stuckGames.map(g => g.hoursExpired))}h oldest)`}
          </div>
          <Button 
            onClick={handleProcessAll}
            disabled={processing.size > 0 || stuckGameCount === 0 || isLoadingAll}
            variant="default"
          >
            Process All Stuck Games
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedStuckGames.map((game) => {
            const isProcessing = processing.has(game.address);
            const isProcessed = processed.has(game.address);
            
            return (
              <div 
                key={game.address}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono">
                    {game.address.slice(0, 8)}...{game.address.slice(-8)}
                  </code>
                  <Badge variant="destructive">
                    {game.state}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {game.hoursExpired}h expired
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Ended: {new Date(game.endTime * 1000).toLocaleDateString()}
                  </span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProcessGame(game.address)}
                  disabled={isProcessing || isProcessed}
                >
                  {isProcessing 
                    ? "Processing..." 
                    : isProcessed 
                      ? "Done" 
                      : "Process"}
                </Button>
              </div>
            );
          })}
        </div>

        {stuckGameCount === 0 && !isLoadingAll && (
          <div className="text-center py-8 text-muted-foreground">
            🎉 No stuck games found! All games are in correct states.
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">What this does:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Calls the <code>process_game_lifecycle</code> instruction</li>
            <li>• Transitions games from &quot;Open&quot; to &quot;Expired&quot; (if past end time)</li>
            <li>• Generates winning numbers for games that should be completed</li>
            <li>• Fixes state synchronization issues</li>
            <li>• Allows the system to create new games</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}