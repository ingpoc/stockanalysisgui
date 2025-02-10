import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useWallet() {
  const { open, close } = useAppKit()
  const { address, isConnected, status } = useAppKitAccount()
  const router = useRouter()

  // Handle connection changes
  useEffect(() => {
    if (status === 'disconnected') {
      router.replace('/auth/login')
    }
  }, [status, router])

  // Connect wallet
  const connect = useCallback(() => open(), [open])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    await close()
    router.replace('/auth/login')
  }, [close, router])

  return {
    address,
    isConnected,
    status,
    connect,
    disconnect
  }
} 