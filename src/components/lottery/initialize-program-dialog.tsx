import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useLotteryProgram } from '@/hooks/use-lottery-program'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { handleProgramError } from '@/lib/utils'
import { toast } from 'sonner'
import { USDC_MINT, TREASURY_WALLET } from '@/lib/constants'

// Default values from constants
const DEFAULT_USDC_MINT = USDC_MINT
const DEFAULT_TREASURY = TREASURY_WALLET

export function InitializeProgramDialog() {
  const [open, setOpen] = useState(false)
  const [usdcMint, setUsdcMint] = useState(DEFAULT_USDC_MINT)
  const [treasury, setTreasury] = useState(DEFAULT_TREASURY)
  const [isLoading, setIsLoading] = useState(false)
  const { connected, publicKey } = useWallet()
  const program = useLotteryProgram()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to initialize the program."
      })
      return
    }

    try {
      setIsLoading(true)
      console.log('Initializing program with mint address:', usdcMint)
      console.log('Using treasury address:', treasury)
      
      const mintPubkey = new PublicKey(usdcMint)
      const treasuryPubkey = new PublicKey(treasury)
      
      await program.initialize(mintPubkey, treasuryPubkey)
      toast.success("Program initialized", {
        description: "The lottery program has been initialized successfully."
      })
      setOpen(false)
    } catch (error) {
      console.error('Program initialization failed:', error)
      const errorMessage = handleProgramError(error)
      toast.error("Initialization failed", {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Initialize Program</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Initialize Lottery Program</DialogTitle>
          <DialogDescription>
            Initialize the lottery program by providing the USDC mint address and treasury address. This is required before creating any lotteries.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usdcMint" className="text-right">
                USDC Mint
              </Label>
              <Input
                id="usdcMint"
                value={usdcMint}
                onChange={(e) => setUsdcMint(e.target.value)}
                className="col-span-3"
                placeholder="Enter USDC mint address"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="treasury" className="text-right">
                Treasury
              </Label>
              <Input
                id="treasury"
                value={treasury}
                onChange={(e) => setTreasury(e.target.value)}
                className="col-span-3"
                placeholder="Enter treasury address"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !connected}>
              {isLoading ? "Initializing..." : "Initialize"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 