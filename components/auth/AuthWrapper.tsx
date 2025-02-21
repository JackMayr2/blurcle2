import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const PUBLIC_PATHS = ['/auth/signin', '/auth/error', '/auth/signup'];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            // @ts-ignore - we added these fields to the user type
            if (!session.user.onboardingComplete &&
                !router.pathname.startsWith('/auth/signup') &&
                !PUBLIC_PATHS.includes(router.pathname)) {
                router.push('/auth/signup');
            }
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
} 