import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Array of public paths that don't require authentication
const publicPaths = [
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/api/auth',
  '/_next',
  '/favicon.ico',
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Check if the path is public
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // For API routes other than auth, just proceed
  if (path.startsWith('/api/') && !path.startsWith('/api/user/')) {
    return NextResponse.next();
  }
  
  try {
    // Check for token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });
    
    console.log('Middleware - Token:', token);
    console.log('Middleware - Path:', path);

    // If there's no token and we're not on a public path, redirect to signin
    if (!token) {
      console.log('No token found, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    console.log('Access granted - proceeding with request');
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to error page
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }
}

// Specify which paths this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes that don't require authentication
     * 2. /_next (Next.js internals)
     * 3. /fonts, /public (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!_next|fonts|favicon.ico|public).*)',
  ],
};