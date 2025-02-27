import { Session } from 'next-auth';

/**
 * Extended session interface that includes additional user properties
 */
export interface ExtendedSession extends Session {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id: string;
        role?: string | null;
        tier?: string | null;
        onboardingComplete?: boolean;
        organizationName?: string | null;
        emailConnected?: boolean;
        twitterConnected?: boolean;
    };
    accessToken?: string;
} 