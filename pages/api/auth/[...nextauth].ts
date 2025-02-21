import NextAuth, { AuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from '../../../lib/prisma';

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: [
                        "openid",
                        "email",
                        "profile",
                        "https://www.googleapis.com/auth/drive.file",
                        "https://www.googleapis.com/auth/drive.readonly",
                        "https://www.googleapis.com/auth/drive.metadata.readonly",
                        "https://www.googleapis.com/auth/documents"
                    ].join(" ")
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account, profile }): Promise<JWT> {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
            }
            return token;
        },
        async session({ session, token }): Promise<Session> {
            session.accessToken = token.accessToken;
            return session;
        },
        async signIn({ user, account, profile }) {
            // Check if user exists in our database
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email! },
            });

            if (!dbUser) {
                // Get signup data from session storage (handled in frontend)
                // This is where you'd implement the logic to create a new user
                return true;
            }

            return true;
        }
    },
    debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions); 