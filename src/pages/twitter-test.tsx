import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TwitterTest() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to district-profile page
        router.push('/district-profile');
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            Redirecting to district profile...
        </div>
    );
} 