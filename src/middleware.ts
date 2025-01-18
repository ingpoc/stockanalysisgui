import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that don't require authentication
const publicPaths = ['/auth/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Get both cookies and their values
  const connectedCookie = request.cookies.get('wagmi.connected')
  const addressCookie = request.cookies.get('wagmi.address')
  
  // Check if both cookies exist and connected is 'true'
  const isAuthenticated = connectedCookie?.value === 'true' && addressCookie?.value

  // Redirect to login if accessing protected route without authentication
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing login while authenticated
  if (isAuthenticated && isPublicPath) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /icon.svg (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|icon.svg).*)',
  ],
} 