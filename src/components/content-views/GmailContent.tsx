import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import DOMPurify from 'dompurify';

interface Email {
    id: string;
    subject: string;
    from: string;
    to: string;
    body: string;
    receivedAt: string;
    labelName: string;
    labelId: string;
}

interface EmailConnection {
    id: string;
    email: string;
    server: string;
    port: number;
}

interface LabelStat {
    labelName: string;
    count: string | number; // Handle both string and number from raw query
}

interface GmailContentProps {
    onError?: (error: string) => void;
}

const GmailContent: React.FC<GmailContentProps> = ({ onError }) => {
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState<EmailConnection | null>(null);
    const [emails, setEmails] = useState<Email[]>([]);
    const [labelStats, setLabelStats] = useState<LabelStat[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Function to sanitize HTML content
    const sanitizeHtml = (html: string) => {
        try {
            return DOMPurify.sanitize(html);
        } catch (error) {
            console.error('Error sanitizing HTML:', error);
            return 'Error displaying email content. The content may contain unsafe HTML.';
        }
    };

    useEffect(() => {
        const fetchGmailContent = async () => {
            try {
                setLoading(true);
                const url = selectedLabel
                    ? `/api/connections/gmail/content?page=${page}&limit=10&label=${encodeURIComponent(selectedLabel)}`
                    : `/api/connections/gmail/content?page=${page}&limit=10`;

                const response = await fetch(url);

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch Gmail content');
                }

                const data = await response.json();
                console.log('Gmail content data:', data);

                setConnection(data.connection || null);
                setEmails(data.emails || []);
                setLabelStats(data.labelStats || []);
                setTotalPages(data.pagination?.pages || 1);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                console.error('Error fetching Gmail content:', errorMessage);
                setError(errorMessage);
                if (onError) onError(errorMessage);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        fetchGmailContent();
    }, [page, selectedLabel, onError, refreshing]);

    const handleRefresh = () => {
        setRefreshing(true);
    };

    const handleLabelSelect = (labelName: string) => {
        setSelectedLabel(labelName === selectedLabel ? null : labelName);
        setPage(1);
    };

    if (loading && !refreshing) {
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

    if (!connection) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">No Gmail connection found. Try reconnecting your account.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (emails.length === 0) {
        return (
            <div className="space-y-6">
                {/* Connection Info */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Connection Details</h3>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{connection.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Server</p>
                            <p className="font-medium">{connection.server}</p>
                        </div>
                    </div>
                </div>

                {labelStats.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-2">Email Labels</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {labelStats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleLabelSelect(stat.labelName)}
                                >
                                    <span className="text-sm font-medium">{stat.labelName}</span>
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                        {typeof stat.count === 'string' ? parseInt(stat.count) : stat.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                No emails have been imported yet. Use the "Update" button on the Gmail card to import emails.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Connection Info */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Connection Details</h3>
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{connection.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Server</p>
                        <p className="font-medium">{connection.server}</p>
                    </div>
                </div>
            </div>

            {/* Label Stats */}
            {labelStats.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-2">Email Labels</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {labelStats.map((stat, index) => (
                            <div
                                key={index}
                                className={`flex justify-between items-center p-2 rounded cursor-pointer ${selectedLabel === stat.labelName ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                                onClick={() => handleLabelSelect(stat.labelName)}
                            >
                                <span className="text-sm font-medium">{stat.labelName}</span>
                                <span className={`text-sm px-2 py-0.5 rounded-full ${selectedLabel === stat.labelName ? 'bg-blue-200 text-blue-900' : 'bg-blue-100 text-blue-800'}`}>
                                    {typeof stat.count === 'string' ? parseInt(stat.count) : stat.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Emails List */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        {selectedLabel ? `Emails in ${selectedLabel}` : 'Recent Emails'}
                        {selectedLabel && (
                            <button
                                onClick={() => setSelectedLabel(null)}
                                className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear filter
                            </button>
                        )}
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className={`inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="inline-flex items-center px-2 py-1 text-xs">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className={`inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {selectedEmail ? (
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-medium">{selectedEmail.subject}</h4>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSelectedEmail(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <div>
                                    <span className="font-medium">From:</span> {selectedEmail.from}
                                </div>
                                <div>
                                    <span className="font-medium">Date:</span> {new Date(selectedEmail.receivedAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                                <span className="font-medium">To:</span> {selectedEmail.to}
                            </div>
                            <div className="text-sm text-gray-500 mb-4">
                                <span className="font-medium">Label:</span> {selectedEmail.labelName}
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            {selectedEmail.body ? (
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedEmail.body) }}
                                />
                            ) : (
                                <p className="text-gray-500 italic">No content available</p>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
                            <button
                                onClick={() => setSelectedEmail(null)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Back to list
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            From
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Label
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {emails.map((email) => (
                                        <tr
                                            key={email.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {email.from && email.from.includes('<') ? email.from.split('<')[0].trim() : email.from}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {email.subject}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(email.receivedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {email.labelName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => setSelectedEmail(email)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex justify-center">
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default GmailContent; 