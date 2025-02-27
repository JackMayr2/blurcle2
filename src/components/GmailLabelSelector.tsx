import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface GmailLabel {
    id: string;
    name: string;
    type: string;
    messagesTotal: number;
}

interface GmailLabelSelectorProps {
    onLabelsSelected: (labels: GmailLabel[]) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function GmailLabelSelector({ onLabelsSelected, isOpen, onClose }: GmailLabelSelectorProps) {
    const { data: session } = useSession();
    const [labels, setLabels] = useState<GmailLabel[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<GmailLabel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [needsReauth, setNeedsReauth] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLabels();
        }
    }, [isOpen]);

    const fetchLabels = async () => {
        setIsLoading(true);
        setError(null);
        setNeedsReauth(false);

        try {
            const response = await fetch('/api/gmail/labels');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch Gmail labels');
            }

            setLabels(data.labels);
        } catch (error) {
            console.error('Error fetching Gmail labels:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Gmail labels';
            setError(errorMessage);

            // Check if this is a permissions error
            if (error instanceof Error &&
                (error.message.includes('Insufficient Permission') ||
                    error.message.includes('insufficient_scope'))) {
                setNeedsReauth(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleReauthenticate = () => {
        signIn('google', {
            callbackUrl: window.location.href,
            scope: 'https://mail.google.com/'
        });
    };

    const toggleLabel = (label: GmailLabel) => {
        setSelectedLabels(prev => {
            const isSelected = prev.some(l => l.id === label.id);
            if (isSelected) {
                return prev.filter(l => l.id !== label.id);
            } else {
                return [...prev, label];
            }
        });
    };

    const handleSubmit = () => {
        onLabelsSelected(selectedLabels);
        onClose();
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
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Gmail Labels</h3>

                    {error && (
                        <div className="text-center p-4">
                            <p className="text-red-600 mb-4">Gmail access permission required</p>
                            <button
                                onClick={handleReauthenticate}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Reconnect with Gmail Access
                            </button>
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                            Select the labels containing emails you want to use for training.
                        </p>

                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="ml-2">Loading labels...</span>
                            </div>
                        ) : (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                {labels.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {labels.map(label => (
                                            <li key={label.id} className="p-3 hover:bg-gray-50">
                                                <label className="flex items-center space-x-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        checked={selectedLabels.some(l => l.id === label.id)}
                                                        onChange={() => toggleLabel(label)}
                                                    />
                                                    <span className="text-sm font-medium text-gray-900">{label.name}</span>
                                                    <span className="text-xs text-gray-500">({label.messagesTotal} emails)</span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        {needsReauth ?
                                            "Please reconnect your Gmail account to access labels." :
                                            "No labels found in your Gmail account."}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={handleSubmit}
                            disabled={selectedLabels.length === 0}
                        >
                            {selectedLabels.length === 0 ? 'Select Labels' : `Import ${selectedLabels.length} ${selectedLabels.length === 1 ? 'Label' : 'Labels'}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 