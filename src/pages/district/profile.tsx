'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '@/components';
import TwitterConnect from '@/components/TwitterConnect';
import { ExtendedSession } from '@/types';

export default function DistrictProfile() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (status === 'authenticated') {
            setIsLoading(false);
        }
    }, [status, router]);

    if (status === 'loading' || isLoading) {
        return <LoadingSpinner />;
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

                    {/* Twitter/X Integration Section */}
                    <div className="mt-8">
                        <TwitterConnect />
                    </div>
                </div>
            </div>
        </div>
    );
}