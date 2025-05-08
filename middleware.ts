
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  // For API routes, we don't need to refresh the session this way,
  // as getIronSession will handle it.
  // This is more for page navigations.
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Refresh the session to keep it alive
  // This will also ensure the cookie is re-set with updated expiration
  try {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    // If there's a user in the session, save it to update the cookie's maxAge
    // This effectively implements a sliding session
    if (session.isLoggedIn && session.user) {
      await session.save();
    }
  } catch (error) {
    console.warn('Middleware session refresh error:', error);
    // Don't block request if session refresh fails for some reason
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login and signup pages (public pages)
     * - api routes are handled differently or excluded if session refresh is not needed.
     * It's generally good to refresh session on most page loads.
     */
    '/((?!_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
};
