import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Handle both token-based and database-based sessions
      if (session.user) {
        // For database sessions with user object
        if (user) {
          session.user.id = user.id;
          // Fetch additional user data from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
          });
          if (dbUser) {
            session.user.role = dbUser.role;
            session.user.onboardingComplete = dbUser.onboardingComplete;
            session.user.organizationName = dbUser.organizationName;
          }
        } 
        // For JWT sessions with token
        else if (token) {
          // Make sure token.sub exists before assigning it
          if (token.sub) {
            session.user.id = token.sub;
          }
          
          if (token.email) {
            // Fetch user data from database using email
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email }
            });
            
            if (dbUser) {
              session.user.id = dbUser.id;
              session.user.role = dbUser.role;
              session.user.onboardingComplete = dbUser.onboardingComplete;
              session.user.organizationName = dbUser.organizationName;
            }
          }
        }
      }
      
      return session;
    },
    async jwt({ token, user }) {
      // Add user ID to token when signed in
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);