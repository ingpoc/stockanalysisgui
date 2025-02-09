import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LotteryProgram } from '@/lib/solana/program'
import { PublicKey } from '@solana/web3.js'
import { BaseSignerWalletAdapter } from '@solana/wallet-adapter-base'


export function useLotteryProgram() {
  const { isConnected, address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('solana')
  const { connection } = useConnection()

  if (!isConnected || !address || !walletProvider) {
    throw new Error('Wallet not connected')
  }

  const adapter = walletProvider as BaseSignerWalletAdapter
  return new LotteryProgram(connection, {
    publicKey: new PublicKey(address),
    signTransaction: adapter.signTransaction.bind(adapter),
    signAllTransactions: adapter.signAllTransactions.bind(adapter),
  })
}


