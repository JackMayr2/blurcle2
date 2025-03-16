'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LoadingSpinner, DrivePicker, GmailLabelSelector } from '@/components';
import type { DriveItem } from '@/types';
import ConnectionCard from '@/components/ConnectionCard';
import ContentViewModal from '@/components/ContentViewModal';
import TwitterContent from '@/components/content-views/TwitterContent';
import GmailContent from '@/components/content-views/GmailContent';
import DriveContent from '@/components/content-views/DriveContent';
import TwitterConnect from '@/components/TwitterConnect';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface DistrictFile {
    id: string;
    name: string;
    googleDriveId: string;
    mimeType: string;
    createdAt: string;
}

interface GmailLabel {
    id: string;
    name: string;
    type: string;
    messagesTotal: number;
}

// Define service types for better organization
type ServiceType = 'twitter' | 'gmail' | 'drive' | 'instagram' | 'facebook';

export default function DistrictProfile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [showPicker, setShowPicker] = useState(false);
    const [showLabelSelector, setShowLabelSelector] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<DriveItem[]>([]);
    const [districtFiles, setDistrictFiles] = useState<DistrictFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isImportingEmails, setIsImportingEmails] = useState(false);
    const [importEmailsError, setImportEmailsError] = useState<string | null>(null);
    const [importEmailsSuccess, setImportEmailsSuccess] = useState<string | null>(null);
    const [hasGoogleAccount, setHasGoogleAccount] = useState(false);
    const [hasGmailScope, setHasGmailScope] = useState(false);
    const [hasTweets, setHasTweets] = useState(false);
    const [hasEmails, setHasEmails] = useState(false);
    const [hasFiles, setHasFiles] = useState(false);

    // State for content modal
    const [showContentModal, setShowContentModal] = useState(false);
    const [contentModalTitle, setContentModalTitle] = useState('');
    const [contentModalService, setContentModalService] = useState<ServiceType | null>(null);
    const [contentModalError, setContentModalError] = useState<string | null>(null);

    // Add state for Twitter connect modal
    const [showTwitterConnect, setShowTwitterConnect] = useState(false);

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

    const checkTweets = async () => {
        try {
            const response = await fetch('/api/connections/twitter/check-tweets');
            if (response.ok) {
                const data = await response.json();
                setHasTweets(data.hasTweets);
            }
        } catch (error) {
            console.error('Error checking tweets:', error);
        }
    };

    const checkEmails = async () => {
        try {
            const response = await fetch('/api/connections/gmail/check-emails');
            if (response.ok) {
                const data = await response.json();
                setHasEmails(data.hasEmails);
            }
        } catch (error) {
            console.error('Error checking emails:', error);
        }
    };

    const checkFiles = async () => {
        try {
            const response = await fetch('/api/connections/drive/check-files');
            if (response.ok) {
                const data = await response.json();
                setHasFiles(data.hasFiles);
            }
        } catch (error) {
            console.error('Error checking files:', error);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        if (status === 'authenticated') {
            // Check if user has Google account connected
            const checkGoogleAccount = async () => {
                try {
                    const response = await fetch('/api/auth/check-google-account');
                    if (response.ok) {
                        const data = await response.json();
                        setHasGoogleAccount(data.hasGoogleAccount);
                        setHasGmailScope(data.hasGmailScope);
                    }
                } catch (error) {
                    console.error('Error checking Google account:', error);
                }
            };

            checkGoogleAccount();
            fetchDistrictFiles();
            checkTweets();
            checkEmails();
            checkFiles();
            setIsLoading(false);
        }
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

    const handleLabelSelect = async (labels: GmailLabel[]) => {
        setShowLabelSelector(false);

        if (labels.length === 0) {
            return;
        }

        try {
            setIsImportingEmails(true);
            setImportEmailsError(null);
            setImportEmailsSuccess(null);

            const response = await fetch('/api/gmail/import-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ labels }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to import emails');
            }

            const data = await response.json();
            setImportEmailsSuccess(`Successfully imported ${data.totalProcessed} emails from ${labels.length} labels.`);

            // Clear success message after 5 seconds
            setTimeout(() => {
                setImportEmailsSuccess(null);
            }, 5000);
        } catch (error) {
            console.error('Error importing emails:', error);
            setImportEmailsError(error instanceof Error ? error.message : 'Failed to import emails');
        } finally {
            setIsImportingEmails(false);
        }
    };

    // Function to handle disconnecting a service
    const handleDisconnectService = async (service: ServiceType) => {
        try {
            const response = await fetch(`/api/connections/${service}/disconnect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to disconnect ${service}`);
            }

            // Update state based on service
            if (service === 'twitter') {
                // Update session to reflect disconnected Twitter
                router.reload();
            } else if (service === 'gmail') {
                setHasGmailScope(false);
            } else if (service === 'drive') {
                // Refresh files list
                setDistrictFiles([]);
            }
        } catch (error) {
            console.error(`Error disconnecting ${service}:`, error);
            alert(`Failed to disconnect ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Function to handle viewing content
    const handleViewContent = (service: ServiceType, title: string) => {
        setContentModalTitle(title);
        setContentModalService(service);
        setContentModalError(null); // Reset any previous errors
        setShowContentModal(true);
    };

    // Function to handle connecting Gmail
    const handleConnectGmail = async () => {
        if (hasGoogleAccount) {
            // If we already have a Google account, just need to add Gmail scope
            signIn('google', {
                callbackUrl: window.location.href,
                scope: 'https://mail.google.com/'
            });
        } else {
            // Need to connect Google account first
            signIn('google', {
                callbackUrl: window.location.href,
                scope: 'https://mail.google.com/'
            });
        }
    };

    // Function to handle updating content
    const handleUpdateService = (service: ServiceType) => {
        if (service === 'twitter') {
            // Instead of scrolling to a section, show a modal or dialog for Twitter connection
            setShowTwitterConnect(true);
        } else if (service === 'gmail') {
            setShowLabelSelector(true);
        } else if (service === 'drive') {
            setShowPicker(true);
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

                    {/* Connections Section */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Connected Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Twitter Connection */}
                            <ConnectionCard
                                title="Twitter / X"
                                isConnected={!!session?.user?.twitterConnected}
                                icon={
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                }
                                description="Connect your Twitter account to import and analyze tweets."
                                onConnect={() => setShowTwitterConnect(true)}
                                onDisconnect={() => handleDisconnectService('twitter')}
                                onUpdate={() => handleUpdateService('twitter')}
                                onViewContent={hasTweets ? () => handleViewContent('twitter', 'Twitter Content') : undefined}
                            />

                            {/* Gmail Connection */}
                            <ConnectionCard
                                title="Gmail"
                                isConnected={hasGoogleAccount && hasGmailScope}
                                icon={
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                                    </svg>
                                }
                                description="Import and analyze emails from your Gmail account."
                                onConnect={handleConnectGmail}
                                onDisconnect={() => handleDisconnectService('gmail')}
                                onUpdate={() => handleUpdateService('gmail')}
                                onViewContent={hasEmails ? () => handleViewContent('gmail', 'Gmail Content') : undefined}
                                additionalInfo={
                                    importEmailsError && (
                                        <div className="mt-2 text-sm text-red-600">
                                            Error: {importEmailsError}
                                        </div>
                                    )
                                }
                            />

                            {/* Google Drive Connection */}
                            <ConnectionCard
                                title="Google Drive"
                                isConnected={hasGoogleAccount}
                                icon={
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.75 13.81v7.44a.75.75 0 0 1-1.5 0v-7.44H2.7a.75.75 0 0 1-.65-1.13l3.6-6.43-3.44-6.13A.75.75 0 0 1 2.84 0h8.41v13.81h1.5zM11.25 0v13.81h-1.5V0h1.5zm2.84 0a.75.75 0 0 1 .65 1.13l-3.6 6.43 3.44 6.13a.75.75 0 0 1-.65 1.13H5.55l4.23-7.56L5.55 0h8.54z" />
                                    </svg>
                                }
                                description="Connect your Google Drive to import and manage files."
                                onConnect={() => setShowPicker(true)}
                                onDisconnect={() => handleDisconnectService('drive')}
                                onUpdate={() => handleUpdateService('drive')}
                                onViewContent={hasFiles ? () => handleViewContent('drive', 'Google Drive Content') : undefined}
                                additionalInfo={
                                    uploadError && (
                                        <div className="mt-2 text-sm text-red-600">
                                            Error: {uploadError}
                                        </div>
                                    )
                                }
                            />

                            {/* Instagram Connection - Placeholder */}
                            <ConnectionCard
                                title="Instagram"
                                isConnected={false}
                                icon={
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                }
                                description="Connect your Instagram account to import and analyze posts."
                                onConnect={() => alert('Instagram integration coming soon!')}
                            />

                            {/* Facebook Connection - Placeholder */}
                            <ConnectionCard
                                title="Facebook"
                                isConnected={false}
                                icon={
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                }
                                description="Connect your Facebook account to import and analyze posts."
                                onConnect={() => alert('Facebook integration coming soon!')}
                            />
                        </div>
                    </div>

                    {/* Email Import Status */}
                    {(isImportingEmails || importEmailsSuccess) && (
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Email Import</h3>

                            {isImportingEmails && (
                                <div className="flex items-center justify-center py-4 bg-blue-50 rounded-md">
                                    <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Importing emails... This may take a few minutes.</span>
                                </div>
                            )}

                            {importEmailsSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-green-700">{importEmailsSuccess}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Gmail Label Selector */}
            <GmailLabelSelector
                isOpen={showLabelSelector}
                onClose={() => setShowLabelSelector(false)}
                onLabelsSelected={handleLabelSelect}
            />

            {/* Drive Picker */}
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

            {/* Content View Modal */}
            <ContentViewModal
                isOpen={showContentModal}
                onClose={() => setShowContentModal(false)}
                title={contentModalTitle}
            >
                {contentModalService === 'twitter' && (
                    <TwitterContent onError={setContentModalError} />
                )}
                {contentModalService === 'gmail' && (
                    <GmailContent onError={setContentModalError} />
                )}
                {contentModalService === 'drive' && (
                    <DriveContent onError={setContentModalError} />
                )}
                {contentModalError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{contentModalError}</p>
                            </div>
                        </div>
                    </div>
                )}
            </ContentViewModal>

            {/* Twitter Connect Modal */}
            {showTwitterConnect && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium">Twitter/X Integration</h2>
                            <button
                                onClick={() => setShowTwitterConnect(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Connect your Twitter/X account to import your tweets and analyze your social media presence.
                                You can also enter a Twitter username to fetch tweets without logging in.
                            </p>
                            <TwitterConnect />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 