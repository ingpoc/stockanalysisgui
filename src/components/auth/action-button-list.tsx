'use client'

import { useTheme } from 'next-themes'
import { useAppKit, useAppKitAccount, useAppKitTheme, useDisconnect } from '@/config'
import { shortenAddress } from '@/lib/utils'

export function ActionButtonList() {
  const modal = useAppKit()
  const { themeMode, setThemeMode } = useAppKitTheme()
  const { setTheme } = useTheme()
  const { address, isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  async function handleDisconnect() {
    try {
      await disconnect()
      modal.close()
    } catch (error) {
      console.error('Error during disconnect:', error)
      // If disconnect fails, try opening the Account view for manual disconnection
      modal.open({
        view: 'Account'
      })
    }
  }

  function handleWalletOptions() {
    modal.open({
      view: 'Account'
    })
  }

  function toggleTheme() {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark'
    setThemeMode(newTheme)
    setTheme(newTheme)
  }

  return (
    <div className="flex items-center gap-2">
      {isConnected && address && (
        <>
          <button
            onClick={handleWalletOptions}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-sm font-medium">{shortenAddress(address)}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button
            onClick={handleDisconnect}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Disconnect"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </>
      )}

    </div>
  )
}