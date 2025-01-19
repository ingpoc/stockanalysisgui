import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { headers } from "next/headers"; // added

// Add paths that don't require authentication
const publicPaths = ['/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Get wagmi store cookie
  const wagmiStore = request.cookies.get('wagmi.store')?.value
  
  const headersData = await headers()
  const cookies = headersData.get('cookie')
  
  let isAuthenticated = false

  try {
    // Check Wagmi (EVM) connection
    if (wagmiStore) {
      const store = JSON.parse(wagmiStore)
      const hasWagmiConnection = store.state?.current && 
        store.state?.connections?.value?.find(
          (conn: any) => conn[0] === store.state.current && conn[1]?.accounts?.length > 0
        )
      
      if (hasWagmiConnection) {
        isAuthenticated = true
      }

     
    }

    

  } catch (error) {
    console.error('Failed to parse store:', error)
  }

  // Redirect to login if not authenticated and accessing protected route
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect to dashboard if authenticated and accessing login
  if (isAuthenticated && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /_static (inside /public)
     * 3. /_vercel (Vercel internals)
     * 4. /favicon.ico, /icon.svg (static files)
     */
    '/((?!_next|_static|_vercel|favicon.ico|icon.svg).*)',
  ],
} 