import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => !!token
    },
});

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/district-profile/:path*',
        '/content-creation/:path*',
        '/api/protected/:path*'
    ]
}; 