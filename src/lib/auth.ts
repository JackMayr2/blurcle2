import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from './prisma';

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
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
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error'
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            console.log('Redirect callback - START', { url, baseUrl });
            if (url.startsWith(baseUrl)) return url;
            if (url.startsWith("/")) return new URL(url, baseUrl).toString();
            return baseUrl;
        },
        async signIn({ user, account, profile }) {
            console.log('SignIn callback - START');
            if (!user.email || !account) {
                console.log('SignIn callback - No email or account provided');
                return false;
            }

            try {
                let dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                    include: {
                        accounts: true
                    }
                });

                console.log('SignIn callback - Database lookup result:', dbUser);

                if (!dbUser) {
                    // Create new user if doesn't exist
                    dbUser = await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            onboardingComplete: false,
                            accounts: {
                                create: {
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    refresh_token: account.refresh_token
                                }
                            }
                        },
                        include: {
                            accounts: true
                        }
                    });
                    console.log('SignIn callback - New user created:', dbUser);
                } else {
                    // Check if this Google account is already linked
                    const existingAccount = await prisma.account.findFirst({
                        where: {
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                        }
                    });

                    if (!existingAccount) {
                        // Link the Google account to the user
                        await prisma.account.create({
                            data: {
                                userId: dbUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                refresh_token: account.refresh_token
                            }
                        });
                        console.log('SignIn callback - Account linked successfully');
                    }
                }

                console.log('SignIn callback - END - Success');
                return true;
            } catch (error) {
                console.error('SignIn callback - ERROR:', error);
                return false;
            }
        },
        async jwt({ token, user, account, trigger, session }) {
            console.log('JWT callback - START', { trigger, tokenSub: token.sub });

            // Handle initial sign in
            if (trigger === "signIn" && user?.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email },
                        select: {
                            id: true,
                            role: true,
                            organizationName: true,
                            onboardingComplete: true
                        }
                    });

                    if (dbUser) {
                        token.id = dbUser.id;
                        token.role = dbUser.role;
                        token.organizationName = dbUser.organizationName;
                        token.onboardingComplete = dbUser.onboardingComplete;
                    }
                } catch (error) {
                    console.error('JWT callback - ERROR:', error);
                }
            }

            // Handle session update
            if (trigger === "update" && session?.user) {
                console.log('JWT Update triggered with session:', session);
                token.role = session.user.role;
                token.organizationName = session.user.organizationName;
                token.onboardingComplete = session.user.onboardingComplete;
            }

            if (account) {
                token.accessToken = account.access_token;
            }

            console.log('JWT callback - END - Final token:', token);
            return token;
        },
        async session({ session, token }) {
            console.log('Session callback - START', { sessionUser: session?.user, token });

            if (session?.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.organizationName = token.organizationName as string;
                session.user.onboardingComplete = token.onboardingComplete as boolean;
                session.accessToken = token.accessToken as string;
            }

            console.log('Session callback - END - Final session:', session);
            return session;
        }
    },
    events: {
        async signIn(message) {
            console.log('SignIn event:', message);
        },
        async session(message) {
            console.log('Session event:', message);
        },
        async signOut(message) {
            console.log('SignOut event:', message);
        }
    },
    debug: true
}; 