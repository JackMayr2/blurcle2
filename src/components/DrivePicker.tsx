import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components';
import type { DriveItem } from '@/types';

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
            const response = await fetch(`/api/drive/list-files?folderId=${folderId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch files');
            }

            const data = await response.json();
            setItems(data);
            setCurrentFolder(folderId);
        } catch (error) {
            console.error('Error fetching files:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch files');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFolderContents('root');
    }, []);

    const handleFolderClick = (item: DriveItem) => {
        if (item.mimeType === 'application/vnd.google-apps.folder') {
            fetchFolderContents(item.id);
            setBreadcrumbs(prev => [...prev, item]);
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        const item = breadcrumbs[index];
        fetchFolderContents(item.id);
        setBreadcrumbs(prev => prev.slice(0, index + 1));
    };

    const toggleItemSelection = (item: DriveItem) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(i => i.id === item.id);
            if (isSelected) {
                return prev.filter(i => i.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleConfirmSelection = () => {
        onSelect(selectedItems);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col h-[600px]">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 p-4 bg-gray-50">
                {breadcrumbs.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {index > 0 && <span className="text-gray-500">/</span>}
                        <button
                            onClick={() => handleBreadcrumbClick(index)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            {item.name}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-4">
                {error && (
                    <div className="text-red-600 mb-4">{error}</div>
                )}
                <ul className="space-y-2">
                    {items.map(item => (
                        <li
                            key={item.id}
                            className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
                        >
                            <input
                                type="checkbox"
                                checked={selectedItems.some(i => i.id === item.id)}
                                onChange={() => toggleItemSelection(item)}
                                className="mr-2"
                            />
                            {item.mimeType === 'application/vnd.google-apps.folder' ? (
                                <button
                                    onClick={() => handleFolderClick(item)}
                                    className="flex items-center"
                                >
                                    <span className="material-icons mr-2">folder</span>
                                    {item.name}
                                </button>
                            ) : (
                                <div className="flex items-center">
                                    <span className="material-icons mr-2">description</span>
                                    {item.name}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Selection Controls */}
            <div className="p-4 border-t">
                <button
                    onClick={handleConfirmSelection}
                    disabled={selectedItems.length === 0}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
                >
                    Select {selectedItems.length} item(s)
                </button>
            </div>
        </div>
    );
} 