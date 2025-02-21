import NextAuth, { AuthOptions, Session, User as NextAuthUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from '../../../lib/prisma';

// Extend the built-in User type
interface User extends NextAuthUser {
    role?: string | null;
    tier?: string | null;
    onboardingComplete?: boolean;
    organizationName?: string | null;
}

// Extend the built-in JWT type
interface ExtendedJWT extends JWT {
    role?: string | null;
    tier?: string | null;
    onboardingComplete?: boolean;
    organizationName?: string | null;
}

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
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account) {
                // Remove fields that aren't in our schema
                delete account.refresh_token_expires_in;
            }
            try {
                if (!account?.provider) return false;

                // Check if user exists
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    include: { accounts: true }
                });

                // If no user exists, create one
                if (!existingUser) {
                    return true; // Let NextAuth create the user
                }

                // If user exists but no account is linked, link the account
                if (existingUser.accounts.length === 0) {
                    await prisma.account.create({
                        data: {
                            userId: existingUser.id,
                            type: account.type,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            access_token: account.access_token,
                            token_type: account.token_type,
                            scope: account.scope,
                            refresh_token: account.refresh_token,
                            expires_at: account.expires_at
                        }
                    });
                    return true;
                }

                // Check if this Google account is already linked
                const linkedAccount = existingUser.accounts.find(
                    (acc) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
                );

                return !!linkedAccount;
            } catch (error) {
                console.error('SignIn Error:', error);
                return false;
            }
        },
        async jwt({ token, account, user }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            if (user) {
                const dbUser = user as User;
                token.id = dbUser.id;
                token.email = dbUser.email;
                token.name = dbUser.name;
                token.role = dbUser.role;
                token.tier = dbUser.tier;
                token.onboardingComplete = dbUser.onboardingComplete;
                token.organizationName = dbUser.organizationName;
            }
            return token;
        },
        async session({ session, token }) {
            const extendedToken = token as ExtendedJWT;
            if (session?.user) {
                const user = await prisma.user.findUnique({
                    where: { email: session.user.email! },
                    include: {
                        accounts: {
                            where: { provider: 'google' },
                            select: { access_token: true }
                        }
                    }
                });

                if (!user) {
                    return session;
                }

                return {
                    ...session,
                    accessToken: user.accounts[0]?.access_token,
                    user: {
                        ...session.user,
                        id: user.id,
                        role: user.role,
                        tier: user.tier,
                        onboardingComplete: user.onboardingComplete,
                        organizationName: user.organizationName
                    }
                };
            }
            return session;
        }
    },
    debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions); 