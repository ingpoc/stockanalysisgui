import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useLotteryProgram } from '@/hooks/use-lottery-program';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { handleProgramError } from '@/lib/utils';
import { toast } from 'sonner';
import { USDC_MINT, TREASURY_WALLET } from '@/lib/constants';

// Default values from constants
const DEFAULT_USDC_MINT = USDC_MINT;
const DEFAULT_TREASURY = TREASURY_WALLET;

interface InitializeProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InitializeProgramDialog({
  open,
  onOpenChange,
}: InitializeProgramDialogProps) {
  const [usdcMint, setUsdcMint] = useState(DEFAULT_USDC_MINT);
  const [treasury, setTreasury] = useState(DEFAULT_TREASURY);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingInitialization, setIsCheckingInitialization] =
    useState(false);
  const [isProgramInitialized, setIsProgramInitialized] = useState(false);
  const { connected, publicKey } = useWallet();
  const program = useLotteryProgram();

  // Check if program is already initialized when dialog opens
  useEffect(() => {
    const checkInitialization = async () => {
      if (!open || !program || !connected) return;

      try {
        setIsCheckingInitialization(true);
        const initialized = await program.isProgramInitialized();
        setIsProgramInitialized(initialized);
      } catch (error) {
        setIsProgramInitialized(false);
      } finally {
        setIsCheckingInitialization(false);
      }
    };

    checkInitialization();
  }, [open, program, connected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to initialize the program.',
      });
      return;
    }

    try {
      setIsLoading(true);

      const mintPubkey = new PublicKey(usdcMint);
      const treasuryPubkey = new PublicKey(treasury);

      await program.initialize();
      toast.success('Program initialized', {
        description: 'The lottery program has been initialized successfully.',
      });
      onOpenChange(false);
    } catch (error) {
      const errorMessage = handleProgramError(error);
      toast.error('Initialization failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Initialize Lottery Program</DialogTitle>
          <DialogDescription>
            {isCheckingInitialization
              ? 'Checking program initialization status...'
              : isProgramInitialized
                ? 'The lottery program is already initialized. You can now create lotteries.'
                : 'Initialize the lottery program by providing the USDC mint address and treasury address. This is required before creating any lotteries.'}
          </DialogDescription>
        </DialogHeader>

        {isCheckingInitialization ? (
          <div className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : isProgramInitialized ? (
          <div className='py-4'>
            <div className='bg-green-50 border border-green-200 rounded-lg p-4 text-center'>
              <div className='text-green-600 font-medium'>
                ✅ Program Already Initialized
              </div>
              <div className='text-green-700 mt-2 text-sm'>
                The lottery program has been successfully initialized. You can
                now proceed to create lotteries.
              </div>
            </div>
            <DialogFooter className='mt-4'>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='usdcMint' className='text-right'>
                  USDC Mint
                </Label>
                <Input
                  id='usdcMint'
                  value={usdcMint}
                  onChange={e => setUsdcMint(e.target.value)}
                  className='col-span-3'
                  placeholder='Enter USDC mint address'
                  required
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='treasury' className='text-right'>
                  Treasury
                </Label>
                <Input
                  id='treasury'
                  value={treasury}
                  onChange={e => setTreasury(e.target.value)}
                  className='col-span-3'
                  placeholder='Enter treasury address'
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type='submit' disabled={isLoading || !connected}>
                {isLoading ? 'Initializing...' : 'Initialize'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
