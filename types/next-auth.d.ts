import 'next-auth';
import { User } from './auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: User;
        accessToken?: string;
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