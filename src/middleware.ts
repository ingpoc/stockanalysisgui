import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { appKit } from '@/config'

export async function middleware(request: NextRequest) {
  const isPublicRoute = ['/auth/login', '/'].includes(request.nextUrl.pathname)
  const isIgnoredRoute = ['/api/auth'].includes(request.nextUrl.pathname)

  if (isPublicRoute || isIgnoredRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get('appkit.token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/stock/:path*",
    "/insights/:path*",
    "/technical/:path*",
    "/api/protected/:path*",
  ]
} 