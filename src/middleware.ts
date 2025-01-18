import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that don't require authentication
const publicPaths = ['/auth/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Get wagmi store cookie and parse it
  const wagmiStore = request.cookies.get('wagmi.store')?.value
  let isAuthenticated = false

  if (wagmiStore) {
    try {
      const store = JSON.parse(wagmiStore)
      const connections = store.state?.connections?.value || []
      // Check if there's an active connection with accounts
      isAuthenticated = connections.some((conn: any) => 
        conn[1]?.accounts?.length > 0 && store.state.current === conn[0]
      )
    } catch (error) {
      console.error('Failed to parse wagmi store:', error)
    }
  }

  // Debug logging
  console.log('Auth Debug:', {
    pathname,
    isPublicPath,
    isAuthenticated,
    wagmiStore
  })

  // Redirect to login if accessing protected route without authentication
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing login while authenticated
  if (isAuthenticated && pathname === '/auth/login') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
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