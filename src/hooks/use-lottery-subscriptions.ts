import { useEffect, useCallback, useRef, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LotteryInfo } from '@/types/lottery'
import { useLotteryProgram } from './use-lottery-program'

export function useLotterySubscriptions() {
  const [isReady, setIsReady] = useState(false)
  const subscriptionsRef = useRef<Map<string, number>>(new Map())
  const { connection } = useConnection()
  const program = useLotteryProgram()

  // Initialize subscriptions
  useEffect(() => {
    setIsReady(true)
    return () => {
      setIsReady(false)
      // Cleanup all subscriptions on unmount
      unsubscribeAll()
    }
  }, [])

  const subscribe = useCallback(async (
    lotteryAddress: string,
    callback: (lottery: LotteryInfo) => void
  ) => {
    try {
      // Unsubscribe from existing subscription if any
      if (subscriptionsRef.current.has(lotteryAddress)) {
        program.unsubscribe(subscriptionsRef.current.get(lotteryAddress)!)
      }

      // Create new subscription
      const subscriptionId = await program.subscribeToLotteryChanges(lotteryAddress, callback)
      subscriptionsRef.current.set(lotteryAddress, subscriptionId)

      return subscriptionId
    } catch (error) {
      console.error('Failed to subscribe to lottery:', error)
      return null
    }
  }, [program])

  const unsubscribe = useCallback((lotteryAddress: string) => {
    const subscriptionId = subscriptionsRef.current.get(lotteryAddress)
    if (subscriptionId) {
      try {
        program.unsubscribe(subscriptionId)
        subscriptionsRef.current.delete(lotteryAddress)
      } catch (error) {
        console.error('Failed to unsubscribe from lottery:', error)
      }
    }
  }, [program])

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach((subscriptionId) => {
      try {
        program.unsubscribe(subscriptionId)
      } catch (error) {
        console.error('Failed to unsubscribe from lottery:', error)
      }
    })
    subscriptionsRef.current.clear()
  }, [program])

  return {
    subscribe,
    unsubscribe,
    unsubscribeAll,
    isReady
  }
} 