import { useSession } from 'next-auth/react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Resources() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Educational Resources
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Access our curated collection of educational materials and templates
                    </p>
                </div>

                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Resource Cards */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Lesson Plan Templates</h3>
                                    <p className="mt-2 text-base text-gray-500">
                                        Professional templates for creating engaging lesson plans
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <a href="#" className="text-primary-600 hover:text-primary-700">
                                    Access Templates →
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Add more resource cards */}
                </div>
            </div>
        </div>
    );
} 