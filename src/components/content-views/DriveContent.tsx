import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface DriveFile {
    id: string;
    name: string;
    googleDriveId: string;
    mimeType: string;
    createdAt: string;
    updatedAt?: string;
}

interface FileTypeStats {
    [key: string]: number;
}

interface DriveContentProps {
    onError?: (error: string) => void;
}

const DriveContent: React.FC<DriveContentProps> = ({ onError }) => {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [stats, setStats] = useState<{ total: number; byType: FileTypeStats }>({ total: 0, byType: {} });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDriveContent = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/connections/drive/content');

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch Google Drive content');
                }

                const data = await response.json();
                console.log('Drive content data:', data);

                setFiles(data.files || []);
                setStats(data.stats || { total: 0, byType: {} });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                console.error('Error fetching Drive content:', errorMessage);
                setError(errorMessage);
                if (onError) onError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchDriveContent();
    }, [onError]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            No files have been imported yet. Use the "Update" button on the Google Drive card to import files.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Helper function to get file icon based on mime type
    const getFileIcon = (mimeType: string) => {
        const type = mimeType.split('/')[0];
        const subtype = mimeType.split('/')[1];

        if (type === 'image') {
            return (
                <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        } else if (type === 'application' && subtype?.includes('spreadsheet')) {
            return (
                <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                </svg>
            );
        } else if (type === 'application' && subtype?.includes('document')) {
            return (
                <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        } else if (type === 'application' && subtype?.includes('presentation')) {
            return (
                <svg className="h-8 w-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
            );
        } else if (type === 'application' && subtype === 'pdf') {
            return (
                <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">File Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Total Files</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                    </div>

                    {Object.entries(stats.byType).map(([type, count]) => (
                        <div key={type} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 capitalize">{type}</p>
                            <p className="text-2xl font-bold text-gray-700">{count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Files List */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Your Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                        <div key={file.id} className="bg-white rounded-lg shadow p-4 flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                {getFileIcon(file.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                                <p className="text-xs text-gray-500 mt-1 capitalize">
                                    {file.mimeType.split('/')[1] || file.mimeType}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Added {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                                <div className="mt-2">
                                    <a
                                        href={`https://drive.google.com/file/d/${file.googleDriveId}/view`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        View in Drive
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DriveContent; 