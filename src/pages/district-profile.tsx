'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LoadingSpinner, DrivePicker } from '@/components';
import type { DriveItem } from '@/types';

interface DistrictFile {
    id: string;
    name: string;
    googleDriveId: string;
    mimeType: string;
    createdAt: string;
}

export default function DistrictProfile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<DriveItem[]>([]);
    const [districtFiles, setDistrictFiles] = useState<DistrictFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Fetch district files
    const fetchDistrictFiles = async () => {
        try {
            const response = await fetch('/api/district/files');
            if (!response.ok) {
                throw new Error('Failed to fetch district files');
            }
            const data = await response.json();
            setDistrictFiles(data.files);
        } catch (error) {
            console.error('Error fetching district files:', error);
        }
    };

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        setIsLoading(false);
        fetchDistrictFiles();
    }, [status, router]);

    const handleFileSelect = async (items: DriveItem[]) => {
        console.log('Selected files:', items);
        setSelectedFiles(items);
        setShowPicker(false);

        try {
            setIsUploading(true);
            setUploadError(null);

            const response = await fetch(`${window.location.origin}/api/district/upload-files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ files: items }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error response:', errorData);
                throw new Error(errorData.error || errorData.message || 'Failed to upload files');
            }

            const data = await response.json();
            console.log('API success response:', data);

            // Refresh the files list
            await fetchDistrictFiles();
            // Clear selected files after successful upload
            setSelectedFiles([]);
        } catch (error) {
            console.error('Error uploading files:', error);
            setUploadError(error instanceof Error ? error.message : 'Failed to upload files');
        } finally {
            setIsUploading(false);
        }
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
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900">District Files</h2>
                                <button
                                    onClick={() => setShowPicker(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add Files
                                </button>
                            </div>

                            {isUploading && (
                                <div className="flex items-center justify-center py-4">
                                    <LoadingSpinner />
                                    <span className="ml-2 text-sm text-gray-600">Uploading files...</span>
                                </div>
                            )}

                            {uploadError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{uploadError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* District Files List */}
                            {districtFiles.length > 0 ? (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Your Files</h3>
                                    <ul className="divide-y divide-gray-200 border-t border-b">
                                        {districtFiles.map((file) => (
                                            <li key={file.id} className="py-3 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <svg className="h-5 w-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-900">{file.name}</span>
                                                </div>
                                                <a
                                                    href={`https://drive.google.com/file/d/${file.googleDriveId}/view`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    View in Drive
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <p className="mt-2">No files uploaded yet</p>
                                </div>
                            )}

                            {/* File Picker Modal */}
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
                                        <DrivePicker onSelect={handleFileSelect} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 