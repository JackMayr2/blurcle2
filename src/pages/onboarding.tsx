import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '@/components/ui';

export default function Onboarding() {
    const { status } = useSession();
    const router = useRouter();
    const isProcessing = false; // Using a constant instead of state since it's never updated

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    if (status === 'loading' || isProcessing) {
        return <LoadingSpinner />;
    }

    const handleGoogleDriveConnect = async () => {
        // Implement Google Drive connection
    };

    const handleDistrictAdd = async () => {
        // For consultants to add districts
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* Steps will be different based on user role */}
            </div>
        </div>
    );
}