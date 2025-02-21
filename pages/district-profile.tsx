'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LoadingSpinner, DrivePicker } from '@/components';
import type { DriveItem } from '@/types';

export default function DistrictProfile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedItems, setSelectedItems] = useState<DriveItem[]>([]);

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        setIsLoading(false);
    }, [status, router]);

    const handleSelection = (items: DriveItem[]) => {
        setSelectedItems(items);
        setShowPicker(false);
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {session?.user?.organizationName || 'Your District'}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage your district files and settings
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        {/* District Info */}
                        <dl className="divide-y divide-gray-200 mb-8">
                            <div className="py-4">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{session?.user?.email}</dd>
                            </div>
                            <div className="py-4">
                                <dt className="text-sm font-medium text-gray-500">Organization</dt>
                                <dd className="mt-1 text-sm text-gray-900">{session?.user?.organizationName || 'Not set'}</dd>
                            </div>
                        </dl>

                        {/* Google Drive Section */}
                        <div className="mt-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Google Drive Integration</h2>
                            <button
                                onClick={() => setShowPicker(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
                                </svg>
                                Select Drive Files
                            </button>

                            {showPicker && (
                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
                                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                            <h2 className="text-lg font-medium">Select Files</h2>
                                            <button
                                                onClick={() => setShowPicker(false)}
                                                className="text-gray-400 hover:text-gray-500"
                                            >
                                                <span className="sr-only">Close</span>
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <DrivePicker onSelect={handleSelection} />
                                    </div>
                                </div>
                            )}

                            {selectedItems.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-900">Selected Files</h3>
                                    <ul className="mt-4 border border-gray-200 rounded-md divide-y divide-gray-200">
                                        {selectedItems.map((item) => (
                                            <li key={item.id} className="px-4 py-3 flex items-center hover:bg-gray-50">
                                                <svg className="h-5 w-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                                </svg>
                                                <span className="text-sm text-gray-900">{item.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 