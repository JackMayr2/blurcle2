import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface EmailConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EmailConnectModal({ isOpen, onClose, onSuccess }: EmailConnectModalProps) {
    const { data: session, update: updateSession } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleConnectGmail = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Check if user already has Gmail access
            const response = await fetch('/api/user/check-gmail-access');
            const data = await response.json();

            if (response.ok && data.hasAccess) {
                // User already has Gmail access, proceed to connect
                await connectEmailWithExistingAccess();
            } else {
                // User needs to grant Gmail access
                await requestGmailAccess();
            }
        } catch (error) {
            console.error('Error connecting Gmail:', error);
            setError(error instanceof Error ? error.message : 'Failed to connect Gmail');
            setIsSubmitting(false);
        }
    };

    const requestGmailAccess = async () => {
        // Redirect to Google OAuth flow with Gmail scope
        await signIn('google', {
            callbackUrl: window.location.href,
            redirect: true,
            scope: 'https://mail.google.com/'
        });
    };

    const connectEmailWithExistingAccess = async () => {
        try {
            const response = await fetch('/api/user/connect-email-oauth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to connect Gmail');
            }

            // Update session with new email connection status
            await updateSession({
                user: {
                    ...session?.user,
                    emailConnected: true,
                }
            });

            setSuccessMessage('Gmail connected successfully!');

            // Wait a moment before closing the modal
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error connecting Gmail:', error);
            setError(error instanceof Error ? error.message : 'Failed to connect Gmail');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Your Email</h3>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                            {successMessage}
                        </div>
                    )}

                    <div className="text-center py-6">
                        <p className="text-sm text-gray-600 mb-6">
                            Connect your Gmail account to send and receive emails directly from our platform.
                            No passwords are stored - we use secure OAuth2 authentication.
                        </p>

                        <button
                            type="button"
                            onClick={handleConnectGmail}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connecting...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018 1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062-2.31 0-4.187 1.956-4.187 4.273 0 2.315 1.877 4.277 4.187 4.277 2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474 0 4.01-2.677 6.86-6.72 6.86z" />
                                    </svg>
                                    Connect with Google
                                </span>
                            )}
                        </button>

                        <p className="mt-4 text-xs text-gray-500">
                            We'll only access your email with your permission and in accordance with our privacy policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 