import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '@/components/ui';
import { ExtendedSession } from '@/types';
import DeleteAccountButton from '@/components/settings/DeleteAccountButton';

export default function Settings() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
            
            {/* Account information section */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                <div className="mb-4">
                    <p className="text-gray-700"><span className="font-medium">Name:</span> {session?.user?.name}</p>
                    <p className="text-gray-700"><span className="font-medium">Email:</span> {session?.user?.email}</p>
                    <p className="text-gray-700"><span className="font-medium">Role:</span> {session?.user?.role || 'Not specified'}</p>
                </div>
            </div>
            
            {/* Danger Zone */}
            <div className="bg-white shadow rounded-lg p-6 border border-red-200">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
                <p className="text-gray-700 mb-6">
                    Deleting your account will permanently remove all your data from our system. This action cannot be undone.
                </p>
                <DeleteAccountButton setIsLoading={setIsLoading} />
            </div>
            
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
}