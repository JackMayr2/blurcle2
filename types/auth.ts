import { DefaultSession } from 'next-auth';

export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
    tier?: UserTier;
    onboardingComplete: boolean;
    organizationName?: string | null;
}

export type UserRole = 'district' | 'consultant';
export type UserTier = 'trial' | 'premium';

export interface Session extends DefaultSession {
    user: User;
    accessToken?: string;
}

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    tier: UserTier;
    organizationName?: string;
    districts?: DistrictInfo[]; // For consultants
    onboardingComplete: boolean;
    createdAt: Date;
    trialEndsAt?: Date;
}

export interface DistrictInfo {
    id: string;
    name: string;
    driveRootFolderId?: string;
    contactEmail?: string;
    contactName?: string;
} 