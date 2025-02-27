import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { Spinner, Modal } from '@/components/ui';

// Content type options
const CONTENT_TYPES = [
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'event', label: 'Event Description' },
    { id: 'policy', label: 'Policy Document' },
    { id: 'email', label: 'Email Template' },
];

export default function ContentCreation() {
    const { data: session } = useSession();

    // State management
    const [contentType, setContentType] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [googleTokenStatus, setGoogleTokenStatus] = useState<'valid' | 'expired' | 'checking' | 'unknown'>('unknown');

    // Check Google token status
    const checkGoogleTokenStatus = async () => {
        try {
            setGoogleTokenStatus('checking');
            const response = await fetch('/api/check-google-token');
            const data = await response.json();

            console.log('Google token status:', data);

            if (data.status === 'valid' || data.status === 'refreshed') {
                setGoogleTokenStatus('valid');
                return true;
            } else {
                setGoogleTokenStatus('expired');
                return false;
            }
        } catch (error) {
            console.error('Error checking Google token status:', error);
            setGoogleTokenStatus('unknown');
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        setSaveSuccess(false);
        setSaveError(null);

        try {
            const response = await fetch('/api/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    contentType
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate content');
            }

            setGeneratedContent(data.content);
            setShowModal(true);
        } catch (error) {
            console.error('Error generating content:', error);
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle save to Google Drive
    const handleSaveToGoogleDrive = async () => {
        if (!generatedContent) return;

        setSaveSuccess(false);
        setSaveError(null);
        setIsLoading(true);

        try {
            // Check Google token status first
            const isTokenValid = await checkGoogleTokenStatus();

            if (!isTokenValid) {
                throw new Error('Your Google session has expired. Please sign out and sign back in to reconnect your Google account.');
            }

            const selectedType = CONTENT_TYPES.find(type => type.id === contentType);
            const fileName = `${selectedType?.label || 'Content'} - ${new Date().toLocaleDateString()}`;

            const response = await fetch('/api/save-to-drive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: generatedContent,
                    fileName,
                    mimeType: 'text/plain',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Check if we need to prompt the user to reconnect their account
                if (data.requiresReconnect) {
                    throw new Error(`${data.error} Please sign out and sign back in to reconnect your Google account.`);
                }
                throw new Error(data.error || 'Failed to save to Google Drive');
            }

            setSaveSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setGeneratedContent(null);
                setPrompt('');
            }, 2000);
        } catch (error) {
            console.error('Error saving to Google Drive:', error);
            setSaveError(error instanceof Error ? error.message : 'Failed to save to Google Drive');
        } finally {
            setIsLoading(false);
        }
    };

    // Check token status when modal is opened
    useEffect(() => {
        if (showModal) {
            checkGoogleTokenStatus();
        }
    }, [showModal]);

    if (!session) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg">Please sign in to access content creation.</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Content Creation | Blurcle</title>
                <meta name="description" content="Create professional content for your school district" />
            </Head>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Content Creation</h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                                Content Type
                            </label>
                            <select
                                id="contentType"
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select a content type</option>
                                {CONTENT_TYPES.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                                Prompt
                            </label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                placeholder="Describe what you want to create..."
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Be specific about your needs, audience, and any key information to include.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <Spinner size="sm" className="mr-2" />
                                        Generating...
                                    </span>
                                ) : (
                                    'Generate Content'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Content Generation Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Generated Content"
                    size="lg"
                >
                    <div className="space-y-4">
                        {generatedContent && (
                            <div className="border border-gray-200 rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
                                <pre className="whitespace-pre-wrap font-sans text-sm">{generatedContent}</pre>
                            </div>
                        )}

                        {saveSuccess && (
                            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                                Successfully saved to Google Drive!
                            </div>
                        )}

                        {saveError && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {saveError}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                            {googleTokenStatus === 'expired' && (
                                <a
                                    href="/api/auth/signout?callbackUrl=/api/auth/signin"
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                >
                                    Reconnect Google Account
                                </a>
                            )}
                            <button
                                onClick={handleSaveToGoogleDrive}
                                disabled={isLoading || googleTokenStatus === 'expired'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <Spinner size="sm" className="mr-2" />
                                        Saving...
                                    </span>
                                ) : (
                                    'Save to Google Drive'
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
} 