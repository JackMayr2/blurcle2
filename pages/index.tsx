import { signIn, useSession } from 'next-auth/react';

export default function Home() {
    const { data: session } = useSession();

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-indigo-800">
                <div className="absolute inset-0">
                    <img
                        className="w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                        alt="Education"
                    />
                    <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply" />
                </div>
                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Transform Your School's Document Management
                    </h1>
                    <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
                        Streamline your educational workflow with our intelligent document management system.
                        Organize, collaborate, and access your materials seamlessly.
                    </p>
                    {!session && (
                        <div className="mt-10">
                            <button
                                onClick={() => signIn('google')}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 space-y-8 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                            Features
                        </h2>
                        <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Everything you need to manage your school documents
                        </p>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-medium text-gray-900">Smart Organization</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    AI-powered organization system that automatically categorizes and tags your documents.
                                </p>
                            </div>
                            {/* Add more features */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 