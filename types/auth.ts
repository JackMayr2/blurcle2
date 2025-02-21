export type UserRole = 'district' | 'consultant';
export type SubscriptionTier = 'trial' | 'premium';

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    tier: SubscriptionTier;
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