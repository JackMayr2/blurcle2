import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../components/LoadingSpinner';

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

export default function Settings() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
    const router = useRouter();

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Profile Settings
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Your personal and organization information
                        </p>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Full name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {session?.user?.name || 'Not available'}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Email address
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {session?.user?.email || 'Not available'}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Role
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                                    {session?.user?.role || 'Not set'}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Organization
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {session?.user?.organizationName || 'Not set'}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Account Type
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                                    {session?.user?.tier || 'Not set'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
} 