import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Add type declaration for the session user
interface SessionUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;  // Added role property
    organizationName?: string;  // Added organizationName property
}

declare module 'next-auth' {
    interface Session {
        user: SessionUser;
        accessToken?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: "openid email profile https://www.googleapis.com/auth/drive.file"
                }
            }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    callbacks: {
        async session({ session, token }) {
            if (session?.user && token.sub) {
                session.user.id = token.sub;
                // Add role to session if it exists in token
                session.user.role = (token as any).role || 'user';  // Default to 'user' if no role specified
                session.user.organizationName = (token as any).organizationName;  // Add this line
            }
            return session;
        },
        async jwt({ token, account, user }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            if (user) {
                token.role = (user as any).role || 'user';  // Default to 'user' if no role specified
                token.organizationName = (user as any).organizationName;  // Add this line
            }
            return token;
        }
    }
};

export default NextAuth(authOptions); 