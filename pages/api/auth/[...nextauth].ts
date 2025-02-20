import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: AuthOptions = {
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
                        "https://www.googleapis.com/auth/drive.metadata.readonly"
                    ].join(" ")
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
            }
            return token;
        },
        async session({ session, token, user }) {
            session.accessToken = token.accessToken;
            return session;
        }
    },
    debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions); 