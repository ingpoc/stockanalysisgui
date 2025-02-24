import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add middleware to protect routes
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected, /api/protected)
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath = path === '/auth/login' || 
                      path === '/auth/register' || 
                      path.startsWith('/api/auth');

  const hasSession = request.cookies.has('next-auth.session-token');

  // Redirect unauthenticated users to login page
  if (!hasSession && !isPublicPath) {
    const searchParams = new URLSearchParams([
      ['returnTo', path],
    ]);
    return NextResponse.redirect(
      new URL(`/auth/login?${searchParams}`, request.url)
    );
  }

  // Redirect authenticated users away from auth pages
  if (hasSession && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except static files and api routes that don't need auth
    '/((?!_next/static|_next/image|favicon.ico|api/public).*)',
  ],
}; 