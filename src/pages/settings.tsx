import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/LoadingSpinner';

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return <LoadingSpinner />;
    }

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            setError(null);

            const response = await fetch('/api/user/delete-account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete account');
            }

            // Sign out the user after successful deletion
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error('Error deleting account:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while deleting your account');
            setIsDeleting(false);
        }
    };

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

                    {/* Danger Zone */}
                    <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-red-600">
                            Danger Zone
                        </h3>
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
                                    <p className="mt-1 text-sm text-red-700">
                                        This will permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowConfirmation(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                            {error && (
                                <div className="mt-2 text-sm text-red-800">
                                    Error: {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Account Deletion</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Are you sure you want to delete your account? This will permanently remove all your data, including:
                        </p>
                        <ul className="list-disc pl-5 mb-4 text-sm text-gray-500">
                            <li>Your profile information</li>
                            <li>All uploaded files</li>
                            <li>Email connections and imported emails</li>
                            <li>Twitter/X connections and imported tweets</li>
                            <li>District information (if applicable)</li>
                        </ul>
                        <p className="text-sm font-medium text-red-600 mb-6">
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </span>
                                ) : (
                                    'Yes, Delete My Account'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 