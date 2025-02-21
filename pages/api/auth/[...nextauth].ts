import NextAuth, { AuthOptions, Session, User as NextAuthUser, Account, Profile } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from '../../../lib/prisma';

// Extend the built-in User type
interface ExtendedUser extends NextAuthUser {
    id: string;
    role?: string | null;
    tier?: string | null;
    onboardingComplete?: boolean;
    organizationName?: string | null;
}

// Extend the built-in JWT type
interface ExtendedJWT extends JWT {
    id?: string;
    role?: string | null;
    tier?: string | null;
    onboardingComplete?: boolean;
    organizationName?: string | null;
    accessToken?: string;
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
            try {
                if (!account?.provider) return false;
                return true;
            } catch (error) {
                console.error('SignIn Error:', error);
                return false;
            }
        },
        async jwt({ token, account, user }) {
            try {
                if (account) {
                    token.accessToken = account.access_token;
                }
                if (user) {
                    const extendedUser = user as ExtendedUser;
                    token.id = extendedUser.id;
                    token.role = extendedUser.role;
                    token.tier = extendedUser.tier;
                    token.onboardingComplete = extendedUser.onboardingComplete;
                    token.organizationName = extendedUser.organizationName;
                }
                return token;
            } catch (error) {
                console.error('JWT Error:', error);
                return token;
            }
        },
        async session({ session, token }) {
            try {
                if (session?.user) {
                    const extendedToken = token as ExtendedJWT;
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
            } catch (error) {
                console.error('Session Error:', error);
                return session;
            }
        }
    },
    debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions); 