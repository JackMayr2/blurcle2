import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from './prisma';

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
                    scope: [
                        "openid",
                        "email",
                        "profile",
                        "https://www.googleapis.com/auth/drive.file",
                        "https://www.googleapis.com/auth/drive.readonly",
                        "https://www.googleapis.com/auth/drive.metadata.readonly"
                    ].join(" ")
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
        async session({ session, token, user }) {
            if (session?.user) {
                session.user.id = token.sub!;
                session.accessToken = token.accessToken;
            }
            return session;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        }
    },
    debug: process.env.NODE_ENV === 'development'
}; 