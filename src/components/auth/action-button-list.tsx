'use client'

 import { useTheme } from 'next-themes'
 import { useAppKit, useAppKitAccount, useAppKitTheme, useDisconnect } from '@/config' // Import useAppKitProviders


 import { shortenAddress } from '@/lib/utils'
 import type { Provider } from '@reown/appkit-adapter-solana'

 export function ActionButtonList() {
   const modal = useAppKit()
   const { themeMode, setThemeMode } = useAppKitTheme()
   const { setTheme } = useTheme()
   const { address, isConnected } = useAppKitAccount()
   const { disconnect } = useDisconnect()


   async function handleDisconnect() {
     try {
       await disconnect(); // Specify providerType as 'solana'
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
       <button
         onClick={toggleTheme}
         className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
       >
         {themeMode === 'light' ? (
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
             <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
           </svg>
         ) : (
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
             <circle cx="12" cy="12" r="5" />
             <line x1="12" y1="1" x2="12" y2="3" />
             <line x1="12" y1="21" x2="12" y2="23" />
             <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
             <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
             <line x1="1" y1="12" x2="3" y2="12" />
             <line x1="21" y1="12" x2="23" y2="12" />
             <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
             <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
           </svg>
         )}
       </button>
     </div>
   )
 }