import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'
import { LotteryProgram } from '@/lib/solana/program'

export function useLotteryProgram() {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()

  return useMemo(() => {
    if (!wallet) {
      throw new Error('Wallet not connected')
    }
    return new LotteryProgram(connection, wallet)
  }, [connection, wallet])
} 