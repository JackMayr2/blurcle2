import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session extends DefaultSession {
        accessToken?: string;
        user: {
            id?: string;
            role?: string;
            tier?: string;
            onboardingComplete?: boolean;
        } & DefaultSession['user']
    }

    interface User {
        role?: string;
        tier?: string;
        onboardingComplete?: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        role?: string;
        tier?: string;
        onboardingComplete?: boolean;
    }
} 