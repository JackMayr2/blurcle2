import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface DriveItem {
    id: string;
    name: string;
    mimeType: string;
}

interface DrivePickerProps {
    onSelect?: (items: DriveItem[]) => void;
}

export default function DrivePicker({ onSelect }: DrivePickerProps) {
    const { data: session } = useSession();
    const [files, setFiles] = useState<DriveItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<DriveItem[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string>('root');
    const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([{ id: 'root', name: 'My Drive' }]);

    const fetchFolderContents = async (folderId: string) => {
        try {
            setError(null);
            if (!session?.accessToken) {
                throw new Error('No access token available');
            }

            const response = await fetch(`/api/drive/list-files?folderId=${folderId}`, {
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please authenticate with Google Drive');
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch files');
            }

            const data = await response.json();
            if (!data.files || !Array.isArray(data.files)) {
                throw new Error('Invalid response format from Google Drive');
            }
            setFiles(data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch files');

            // If authentication error, trigger sign in
            if (error instanceof Error && error.message.includes('authenticate')) {
                signIn('google', {
                    callbackUrl: window.location.href,
                    scope: 'https://www.googleapis.com/auth/drive.readonly'
                });
            }
        }
    };

    const handleFolderClick = async (folder: DriveItem) => {
        setCurrentFolderId(folder.id);
        setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
        await fetchFolderContents(folder.id);
    };

    const handleBreadcrumbClick = async (index: number) => {
        const newPath = folderPath.slice(0, index + 1);
        const folderId = newPath[newPath.length - 1].id;
        setFolderPath(newPath);
        setCurrentFolderId(folderId);
        await fetchFolderContents(folderId);
    };

    const handleItemSelect = (item: DriveItem) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(i => i.id === item.id);
            if (isSelected) {
                return prev.filter(i => i.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleFolderDoubleClick = (folder: DriveItem) => {
        setCurrentFolderId(folder.id);
        setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
        fetchFolderContents(folder.id);
    };

    const handleConfirm = () => {
        if (onSelect) {
            onSelect(selectedItems);
        }
    };

    // Separate files and folders
    const folders = files.filter(file => file.mimeType === 'application/vnd.google-apps.folder');
    const documents = files.filter(file => file.mimeType !== 'application/vnd.google-apps.folder');

    // Authentication error UI
    if (error?.includes('authenticate')) {
        return (
            <div className="text-center p-4">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => signIn('google', {
                        callbackUrl: window.location.href,
                        scope: 'https://www.googleapis.com/auth/drive.readonly'
                    })}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Connect to Google Drive
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] max-h-[80vh] bg-white rounded-lg">
            {/* Header with breadcrumbs */}
            <div className="flex items-center p-4 border-b">
                <div className="flex items-center space-x-2 text-sm overflow-x-auto whitespace-nowrap">
                    {folderPath.map((folder, index) => (
                        <div key={folder.id} className="flex items-center">
                            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                            <button
                                onClick={() => handleBreadcrumbClick(index)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                {folder.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto p-4">
                {error && (
                    <div className="text-red-600 mb-4">
                        {error}
                    </div>
                )}

                {/* Folders section */}
                {folders.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Folders</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {folders.map((folder) => (
                                <div
                                    key={folder.id}
                                    onClick={() => handleItemSelect(folder)}
                                    onDoubleClick={() => handleFolderDoubleClick(folder)}
                                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${selectedItems.some(item => item.id === folder.id)
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="relative">
                                        <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                        {selectedItems.some(item => item.id === folder.id) && (
                                            <svg className="h-4 w-4 text-blue-600 absolute -top-1 -right-1 bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="mt-2 text-sm text-center text-gray-600 truncate w-full">
                                        {folder.name}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                        Double-click to open
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files section */}
                {documents.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Files</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {documents.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => handleItemSelect(file)}
                                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${selectedItems.some(item => item.id === file.id)
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="relative">
                                        <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                        </svg>
                                        {selectedItems.some(item => item.id === file.id) && (
                                            <svg className="h-4 w-4 text-blue-600 absolute -top-1 -right-1 bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="mt-2 text-sm text-center text-gray-600 truncate w-full">
                                        {file.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {files.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg className="h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                        <p>This folder is empty</p>
                    </div>
                )}
            </div>

            {/* Footer with selection info and actions */}
            <div className="border-t p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                    </span>
                    {selectedItems.length > 0 && (
                        <button
                            onClick={handleConfirm}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Confirm Selection
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 