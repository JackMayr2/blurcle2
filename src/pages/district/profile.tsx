'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '@/components';

interface DistrictInfo {
    id: string;
    name: string;
    contactEmail: string;
    contactName: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ExtendedSession {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id: string;
        role?: string | null;
        tier?: string | null;
        onboardingComplete?: boolean;
        organizationName?: string | null;
    };
}

export default function DistrictProfile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [district, setDistrict] = useState<DistrictInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (status === 'authenticated') {
            setIsLoading(false);
        }
    }, [status, router]);

    useEffect(() => {
        const fetchDistrictInfo = async () => {
            try {
                console.log('Fetching district info...');
                const response = await fetch('/api/district/info', {
                    credentials: 'include'
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch district info');
                }

                console.log('Received district data:', data);
                setDistrict(data);
            } catch (error) {
                console.error('Error fetching district info:', error);
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchDistrictInfo();
        }
    }, [session]);

    if (status === 'loading' || isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-700">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {session?.user?.name || 'District Profile'}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage your district information and settings
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <dl className="divide-y divide-gray-200">
                            <div className="py-4">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{session?.user?.email}</dd>
                            </div>
                            <div className="py-4">
                                <dt className="text-sm font-medium text-gray-500">Organization</dt>
                                <dd className="mt-1 text-sm text-gray-900">{session?.user?.organizationName || 'Not set'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
} 