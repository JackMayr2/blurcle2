import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string | null;
            tier?: string | null;
            onboardingComplete?: boolean;
            organizationName?: string | null;
        }
        accessToken?: string;
    }

    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
        tier?: string | null;
        onboardingComplete?: boolean;
        organizationName?: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        sub?: string;
        role?: string | null;
        tier?: string | null;
        onboardingComplete?: boolean;
        organizationName?: string | null;
        accessToken?: string;
    }
} 