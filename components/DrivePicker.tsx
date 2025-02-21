'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from './LoadingSpinner';

interface DriveItem {
    id: string;
    name: string;
    mimeType: string;
    selected?: boolean;
    parents?: string[];
}

interface DrivePickerProps {
    onSelect: (selectedItems: DriveItem[]) => void;
}

export default function DrivePicker({ onSelect }: DrivePickerProps) {
    const { data: session } = useSession();
    const [items, setItems] = useState<DriveItem[]>([]);
    const [currentFolder, setCurrentFolder] = useState<string>('root');
    const [breadcrumbs, setBreadcrumbs] = useState<DriveItem[]>([{ id: 'root', name: 'My Drive', mimeType: 'folder' }]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<DriveItem[]>([]);

    const fetchFolderContents = async (folderId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('Fetching folder contents for:', folderId);

            const response = await fetch(`/api/drive/list-files?folderId=${folderId}&q=`, {
                credentials: 'include' // This ensures cookies are sent
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch files');
            }

            const data = await response.json();
            console.log('Received files:', data);
            setItems(data);
            setCurrentFolder(folderId);
        } catch (error) {
            console.error('Error:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch files');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFolderClick = async (folder: DriveItem) => {
        const newBreadcrumbs = [...breadcrumbs, { id: folder.id, name: folder.name, mimeType: folder.mimeType }];
        setBreadcrumbs(newBreadcrumbs);
        await fetchFolderContents(folder.id);
    };

    const handleBreadcrumbClick = async (index: number) => {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        await fetchFolderContents(newBreadcrumbs[index].id);
    };

    const toggleItemSelection = (item: DriveItem) => {
        const isSelected = selectedItems.some(i => i.id === item.id);
        if (isSelected) {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleConfirmSelection = () => {
        onSelect(selectedItems);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Breadcrumbs */}
            <div className="px-4 py-3 border-b border-gray-200">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        {breadcrumbs.map((crumb, index) => (
                            <li key={crumb.id}>
                                <div className="flex items-center">
                                    {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                                    <button
                                        onClick={() => handleBreadcrumbClick(index)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        {crumb.name}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            {/* File/Folder List */}
            <div className="overflow-y-auto max-h-96">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-red-600">{error}</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {items.map((item) => (
                            <li key={item.id} className="p-4 hover:bg-gray-50 flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.some(i => i.id === item.id)}
                                    onChange={() => toggleItemSelection(item)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-4"
                                />
                                {item.mimeType === 'application/vnd.google-apps.folder' ? (
                                    <button
                                        onClick={() => handleFolderClick(item)}
                                        className="flex items-center text-left flex-1"
                                    >
                                        <svg className="h-5 w-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                        <span>{item.name}</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center flex-1">
                                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                        </svg>
                                        <span>{item.name}</span>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Selection Controls */}
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                    {selectedItems.length} items selected
                </span>
                <button
                    onClick={handleConfirmSelection}
                    disabled={selectedItems.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Confirm Selection
                </button>
            </div>
        </div>
    );
} 