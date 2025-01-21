import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { Connection, PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import idl from './crypto_lottery_idl.json'
import { CryptoLotteryProgram } from '@/types/crypto_lottery_program'
const PROGRAM_ID = new PublicKey('DRmPDrBUrF1R4Y7tdKRfjFKQPsdQdtvTEbQY5Qp9GzqY')

export function useLotteryProgram() {
  const { walletProvider } = useAppKitProvider('solana')
  const { isConnected, address } = useAppKitAccount()

  return useMemo(() => {
    if (!isConnected || !walletProvider || !address) return null

    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!)
      const provider = new AnchorProvider(
        connection,
        walletProvider as any, // AppKit's wallet provider is compatible with Anchor's Wallet interface
        { commitment: 'confirmed' }
      )

      return new Program(idl as CryptoLotteryProgram, provider)
    } catch (error) {
      console.error('Error creating program:', error)
      return null
    }
  }, [walletProvider, isConnected, address])
} 