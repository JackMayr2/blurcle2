import { DefaultSession } from 'next-auth';

// Export auth types
export * from './auth';

// Export Google API types
export * from './google';

// Export LLM types
export * from './llm';

// Export Next Auth types
export * from './next-auth';

// Export session types
export * from './session';

// Export database model types
export * from './models';

// Add model types that match our Prisma schema
export type UserRole = 'district' | 'consultant';
export type UserTier = 'trial' | 'premium' | 'free';

// Common component prop types
export interface BaseProps {
    className?: string;
    children?: React.ReactNode;
}

// API response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Extend the default session type
export interface ExtendedSession extends DefaultSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    onboardingComplete?: boolean;
  };
}

// Add any other types your application needs