import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public files and public pages like login and API routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.match(PUBLIC_FILE)
  ) {
    return NextResponse.next();
  }

  // Note: Since tokens are stored in localStorage (client-side),
  // we cannot check them in middleware (server-side).
  // Auth protection is handled by useAuth hook in components.
  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/trainer/:path*', '/admin/:path*'],
};
