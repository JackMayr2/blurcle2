import { ReactNode } from 'react';

interface ConnectionCardProps {
    title: string;
    isConnected: boolean;
    icon: ReactNode;
    description: string;
    onConnect: () => void;
    onDisconnect?: () => void;
    onUpdate?: () => void;
    onViewContent?: () => void;
    additionalInfo?: ReactNode;
}

export default function ConnectionCard({
    title,
    isConnected,
    icon,
    description,
    onConnect,
    onDisconnect,
    onUpdate,
    onViewContent,
    additionalInfo
}: ConnectionCardProps) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:px-6 flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                    {icon}
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {isConnected && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Connected
                        </span>
                    )}
                </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500 mb-4">{description}</p>

                {isConnected ? (
                    <div className="flex flex-wrap gap-2">
                        {onViewContent && (
                            <button
                                onClick={onViewContent}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                View Content
                            </button>
                        )}
                        {onUpdate && (
                            <button
                                onClick={onUpdate}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Update
                            </button>
                        )}
                        {onDisconnect && (
                            <button
                                onClick={onDisconnect}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={onConnect}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Connect
                    </button>
                )}

                {additionalInfo && (
                    <div className="mt-3">
                        {additionalInfo}
                    </div>
                )}
            </div>
        </div>
    );
} 