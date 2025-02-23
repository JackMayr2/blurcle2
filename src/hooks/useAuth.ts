import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export type UserRole = 'user' | 'admin' | string;

export function useAuth(requiredRole?: UserRole) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace('/auth/signin');
        } else if (requiredRole && session?.user?.role !== requiredRole) {
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, requiredRole, session, router]);

    return { session, isLoading, isAuthenticated };
}

export default useAuth; 