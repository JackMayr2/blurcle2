import { api } from '@/lib/api';
import { UserWithRelations, UserProfile } from '@/types';

/**
 * Get the current user's profile
 */
export async function getCurrentUser() {
    return api.get<UserProfile>('/api/user/profile');
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(data: Partial<UserProfile>) {
    return api.put<UserProfile>('/api/user/profile', data);
}

/**
 * Check if Google token is valid and refresh if needed
 */
export async function checkGoogleToken() {
    return api.get<{ valid: boolean }>('/api/check-google-token');
}

/**
 * Complete user onboarding
 */
export async function completeOnboarding(data: {
    role: string;
    organizationName?: string;
}) {
    return api.post<UserProfile>('/api/user/onboarding', data);
}

/**
 * User service with all user-related API functions
 */
export const userService = {
    getCurrentUser,
    updateUserProfile,
    checkGoogleToken,
    completeOnboarding
}; 