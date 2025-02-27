import { useCallback } from 'react';
import { useFetch } from './useApi';
import { userService } from '@/services';
import { UserProfile } from '@/types';

/**
 * Custom hook for fetching and managing user data
 */
export function useUser() {
    const {
        data: user,
        isLoading,
        error,
        execute: refetch,
        setData: setUser
    } = useFetch<UserProfile>(userService.getCurrentUser);

    const updateProfile = useCallback(
        async (data: Partial<UserProfile>) => {
            const response = await userService.updateUserProfile(data);
            if (response.success && response.data) {
                setUser(response.data);
            }
            return response;
        },
        [setUser]
    );

    const completeOnboarding = useCallback(
        async (data: { role: string; organizationName?: string }) => {
            const response = await userService.completeOnboarding(data);
            if (response.success && response.data) {
                setUser(response.data);
            }
            return response;
        },
        [setUser]
    );

    return {
        user,
        isLoading,
        error,
        refetch,
        updateProfile,
        completeOnboarding
    };
}

export default useUser; 