'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/LoadingSpinner';
import DrivePicker from '@/components/DrivePicker';
import { useAuth } from '@/hooks/useAuth';
import { Session } from 'next-auth';
import { DriveItem } from '@/types/google';

interface ExtendedSession extends Session {
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
    const { session, isLoading } = useAuth('district') as { session: ExtendedSession | null, isLoading: boolean };
    const router = useRouter();
    const [showPicker, setShowPicker] = useState(false);
    const [selectedItems, setSelectedItems] = useState<DriveItem[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const handleRouteChange = () => {
            setIsTransitioning(true);
        };

        router.events.on('routeChangeStart', handleRouteChange);
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, [router]);

    useEffect(() => {
        if (isLoading) {
            setIsTransitioning(true);
        }
    }, [isLoading]);

    const handleSelection = (items: DriveItem[]) => {
        setSelectedItems(items);
        setShowPicker(false);
    };

    if (isLoading || isTransitioning) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center transition-opacity duration-300">
                <div className="text-center">
                    <LoadingSpinner className="h-12 w-12" />
                    <p className="mt-4 text-sm text-gray-600">Loading...</p>
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
                            {session?.user?.organizationName || 'Your District'}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Welcome to your district dashboard
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <button
                            onClick={() => setShowPicker(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Select Drive Files
                        </button>

                        {showPicker && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
                                    <div className="p-4 border-b border-gray-200">
                                        <h2 className="text-lg font-medium">Select Files</h2>
                                    </div>
                                    <DrivePicker onSelect={handleSelection} />
                                </div>
                            </div>
                        )}

                        {selectedItems.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900">Selected Items</h3>
                                <ul className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
                                    {selectedItems.map((item) => (
                                        <li key={item.id} className="py-4 flex items-center">
                                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
    );
} 