import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import type { UserRole } from '@/types/auth';

export function useAuth(requiredRole?: UserRole) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';

    useEffect(() => {
        if (status === 'loading') return;

        if (!isAuthenticated) {
            router.push('/auth/signin');
            return;
        }

        if (requiredRole && session?.user?.role !== requiredRole) {
            // Only redirect if we're not already on the dashboard
            if (router.pathname !== '/dashboard') {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, requiredRole, session, router, router.pathname]);

    return { session, isLoading, isAuthenticated };
}

export default useAuth; 