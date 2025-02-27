import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
    const { data: session } = useSession();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center">
                    {/* Logo */}
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-blue-600 rounded-full opacity-70 blur-lg"></div>
                        <div className="absolute inset-4 bg-indigo-500 rounded-full opacity-60 blur-md"></div>
                        <div className="absolute inset-8 bg-blue-400 rounded-full opacity-50 blur-sm"></div>
                    </div>

                    <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
                        Blurcle
                    </h1>
                    <p className="mt-3 text-xl text-indigo-600 font-medium">
                        Bringing clarity to school communications
                    </p>
                    <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
                        Empower your school district with AI-driven communication tools, streamlined content creation,
                        and professional PR management—all in one intuitive platform.
                    </p>


                </div>

                {/* Feature Grid */}
                <div className="mt-24 grid gap-8 md:grid-cols-3">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Content</h3>
                        <p className="mt-2 text-gray-600">Generate professional communications with our advanced AI tools.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Document Management</h3>
                        <p className="mt-2 text-gray-600">Organize and access your communications seamlessly with Google Drive integration.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Professional PR Tools</h3>
                        <p className="mt-2 text-gray-600">Manage your district's public relations with expert templates and tools.</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 