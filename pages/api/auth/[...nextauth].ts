import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    access_type: "offline",
                    prompt: "consent",
                    response_type: "code",
                    scope: "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/documents"
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error'
    },
    callbacks: {
        async signIn({ user, account }) {
            return true;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.sub!;
                session.user.role = token.role;
                session.user.tier = token.tier;
                session.user.onboardingComplete = token.onboardingComplete;
                session.user.organizationName = token.organizationName;
                session.accessToken = token.accessToken;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role;
                token.tier = user.tier;
                token.onboardingComplete = user.onboardingComplete;
                token.organizationName = user.organizationName;
            }
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        }
    },
    debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions); 