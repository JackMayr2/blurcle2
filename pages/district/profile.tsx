import React from 'react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/LoadingSpinner';

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
    const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
    const router = useRouter();
    const [district, setDistrict] = useState<DistrictInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (status === 'authenticated' && session?.user?.role !== 'district') {
            router.push('/dashboard');
            return;
        }

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
    }, [session, status, router]);

    if (isLoading || status === 'loading') {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        District Profile
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        District information and details
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                District Name
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {district?.name || session?.user?.organizationName || 'Not available'}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Contact Email
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {district?.contactEmail || session?.user?.email || 'Not available'}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Contact Name
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {district?.contactName || session?.user?.name || 'Not available'}
                            </dd>
                        </div>
                        {/* Debug information in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="bg-gray-100 px-4 py-5 sm:px-6">
                                <details>
                                    <summary className="text-sm font-medium text-gray-500 cursor-pointer">
                                        Debug Info
                                    </summary>
                                    <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                                        {JSON.stringify({ district, session }, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </div>
    );
} 