import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        console.log('Middleware - Token:', token); // Debug log
        console.log('Middleware - Path:', path); // Debug log

        // Public paths that don't require authentication
        const publicPaths = ['/auth/signin', '/auth/error', '/api/auth'];
        if (publicPaths.some(p => path.startsWith(p))) {
            console.log('Public path access granted:', path);
            return NextResponse.next();
        }

        // If no token, redirect to signin
        if (!token) {
            console.log('No token found, redirecting to signin');
            return NextResponse.redirect(new URL('/auth/signin', req.url));
        }

        // If profile is incomplete and not already on signup page
        if (token.onboardingComplete === false &&
            !path.startsWith('/auth/signup') &&
            !path.startsWith('/api/')) {
            console.log('Redirecting to signup - incomplete profile'); // Debug log
            return NextResponse.redirect(new URL('/auth/signup', req.url));
        }

        // If profile is complete but trying to access signup
        if (token.onboardingComplete === true && path.startsWith('/auth/signup')) {
            console.log('Redirecting from signup - profile complete'); // Debug log
            const redirectUrl = token.role === 'district' ? '/district-profile' : '/dashboard';
            return NextResponse.redirect(new URL(redirectUrl, req.url));
        }

        console.log('Access granted - proceeding with request');
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                console.log('Middleware authorization check - Token:', token); // Debug log
                // Allow the request to proceed to the middleware function
                return true;
            }
        }
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/district-profile/:path*',
        '/content-creation/:path*',
        '/auth/signup',
        '/'
    ]
}; 