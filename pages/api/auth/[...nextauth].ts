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
            if (session?.user && token.sub) {  // Add null check for token.sub
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        }
    }
};

export default NextAuth(authOptions); 