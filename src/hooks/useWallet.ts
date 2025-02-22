import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

export function useWallet() {
  const { publicKey, connected, connecting, disconnect } = useSolanaWallet()

  return {
    address: publicKey?.toBase58() || null,
    isConnected: connected,
    isConnecting: connecting,
    disconnect,
    publicKey: publicKey || null,
  }
} 