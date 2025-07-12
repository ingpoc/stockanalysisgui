'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PageContainer } from '@/components/layout/page-container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Trophy, DollarSign, Users, Clock } from 'lucide-react';
import { useAuthNavigation } from '@/lib/navigation';
import { useLottery } from '@/hooks/useLottery';
import { useRoulette } from '@/hooks/useRoulette';
import { ADMIN_WALLET } from '@/lib/constants';
import { AdminLotteryTable } from '@/components/admin/admin-lottery-table';
import { TreasuryDashboard } from '@/components/admin/treasury-dashboard';
import { AdminStats } from '@/components/admin/admin-stats';
import { RouletteStats } from '@/components/admin/roulette-stats';
import { ProcessStuckGames } from '@/components/admin/process-stuck-games';
import { InitializeProgramDialog } from '@/components/lottery/initialize-program-dialog';
import { CreateLotteryDialog } from '@/components/lottery/create-lottery-dialog';
import { toast } from 'sonner';
import { RouletteType } from '@/types/generated/enhanced-types';

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { connected, publicKey } = useWallet();
  const navigation = useAuthNavigation();
  const { lotteries, isLoading, error } = useLottery();

  const {
    roulettes,
    isLoading: rouletteLoading,
    error: rouletteError,
    isInitialized: rouletteInitialized,
    initialize: initializeRoulette,
    isInitializing: isInitializingRoulette,
    createNextGame,
    isCreatingNext,
  } = useRoulette();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && !connected) {
      navigation.toLogin('/admin');
    }
  }, [connected, navigation, isMounted]);

  // Check if user is admin
  const isAdmin = publicKey?.toBase58() === ADMIN_WALLET;

  // Roulette admin handlers
  const handleInitializeRoulette = async () => {
    try {
      await initializeRoulette();
      toast.success('Roulette program initialized successfully!');
    } catch (error) {}
  };

  const handleCreateFirstGame = async () => {
    try {
      // Add randomness to avoid nonce collisions
      const nonce = Date.now() + Math.floor(Math.random() * 1000);
      await createNextGame(nonce);
      toast.success('First roulette game created! Automation started.');
    } catch (error) {}
  };

  if (!isMounted) {
    return null;
  }

  if (!isAdmin) {
    return (
      <PageContainer>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have administrator privileges. Only the admin wallet
            can access this page.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Admin Controls */}
      <div className='mb-16'>
        <div className='flex items-center justify-between pb-8 border-b border-gray-200'>
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-4'>
              ADMIN CONTROLS
            </div>
            <div className='flex gap-4'>
              <button
                onClick={() => setShowInitDialog(true)}
                className='px-4 py-2 text-xs text-gray-600 border border-gray-300 hover:border-gray-900 hover:text-gray-900 transition-colors duration-200 uppercase tracking-wider'
              >
                INITIALIZE
              </button>
              <button
                onClick={() => setShowCreateDialog(true)}
                className='px-4 py-2 text-xs text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wider'
              >
                CREATE
              </button>
            </div>
          </div>
          <div className='text-right'>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-1'>
              ADMIN WALLET
            </div>
            <div className='text-sm font-mono text-gray-600'>
              {publicKey?.toBase58().slice(0, 8)}...
              {publicKey?.toBase58().slice(-8)}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="roulette" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roulette">Roulette Management</TabsTrigger>
          <TabsTrigger value="lottery">Lottery Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roulette" className="space-y-16">
          {/* Roulette Stats */}
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
              ROULETTE STATISTICS
            </div>
            <RouletteStats roulettes={roulettes || []} isLoading={rouletteLoading} />
          </div>

          {/* Roulette Management */}
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
              ROULETTE MANAGEMENT
            </div>

            {rouletteError && (
              <Alert variant='destructive' className='mb-6'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Roulette Error</AlertTitle>
                <AlertDescription>
                  {rouletteError instanceof Error
                    ? rouletteError.message
                    : 'An unknown error occurred'}
                </AlertDescription>
              </Alert>
            )}

            <div className='bg-white border border-gray-200 rounded-lg p-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                <div>
                  <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                    PROGRAM STATUS
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      rouletteInitialized === true
                        ? 'text-gray-900'
                        : rouletteInitialized === false
                          ? 'text-gray-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {rouletteInitialized === true
                      ? 'Initialized'
                      : rouletteInitialized === false
                        ? 'Not Initialized'
                        : 'Checking...'}
                  </div>
                </div>

                <div>
                  <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                    ACTIVE GAMES
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {rouletteLoading
                      ? 'Loading...'
                      : Array.isArray(roulettes)
                        ? roulettes.length
                        : 0}
                  </div>
                </div>

                <div>
                  <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                    AUTOMATION
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    Program Level
                  </div>
                </div>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={handleInitializeRoulette}
                  disabled={isInitializingRoulette}
                  className='px-4 py-2 text-xs text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wider disabled:opacity-50'
                >
                  {isInitializingRoulette
                    ? 'INITIALIZING...'
                    : rouletteInitialized
                      ? 'REINITIALIZE ROULETTE'
                      : 'INITIALIZE ROULETTE'}
                </button>

                <button
                  onClick={handleCreateFirstGame}
                  disabled={isCreatingNext || !rouletteInitialized}
                  className='px-4 py-2 text-xs text-white bg-green-600 border border-green-600 hover:bg-green-700 hover:border-green-700 transition-colors duration-200 uppercase tracking-wider disabled:opacity-50'
                >
                  {isCreatingNext ? 'CREATING...' : 'CREATE FIRST GAME'}
                </button>
                {/* System runs automatically after initialization */}
              </div>
            </div>
          </div>

          {/* Process Stuck Games */}
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
              STUCK GAMES RECOVERY
            </div>
            <ProcessStuckGames />
          </div>
        </TabsContent>

        <TabsContent value="lottery" className="space-y-16">
          {/* Lottery Stats */}
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
              LOTTERY STATISTICS
            </div>
            <AdminStats lotteries={lotteries || []} isLoading={isLoading} />
          </div>

          {/* Treasury Dashboard */}
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
              TREASURY OVERVIEW
            </div>
            <TreasuryDashboard
              lotteries={lotteries || []}
              isLoading={isLoading}
            />
          </div>

          {/* Lottery Management Table */}
          <div>
            <div className='text-xs text-gray-400 uppercase tracking-wider mb-8'>
              LOTTERY MANAGEMENT
            </div>
            <AdminLotteryTable
              lotteries={lotteries || []}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      <InitializeProgramDialog
        open={showInitDialog}
        onOpenChange={setShowInitDialog}
      />
      <CreateLotteryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </PageContainer>
  );
}
