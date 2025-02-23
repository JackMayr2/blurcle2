export default function About() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative py-16 bg-primary-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-primary-200 font-semibold tracking-wide uppercase">About Us</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                            Revolutionizing Educational Document Management
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-primary-100 lg:mx-auto">
                            SchoolDrive was founded with a simple mission: make document management effortless for educators.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission & Values */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">Our Mission</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    To empower educational institutions with intelligent document management solutions that enhance collaboration,
                                    streamline workflows, and allow educators to focus on what matters most - teaching.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">Our Vision</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    To become the global standard for educational document management, creating a future where technology
                                    seamlessly supports the educational journey.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">Our Values</h3>
                                <ul className="mt-2 text-base text-gray-500 space-y-2">
                                    <li>• Innovation in Education</li>
                                    <li>• Security & Privacy First</li>
                                    <li>• User-Centric Design</li>
                                    <li>• Continuous Improvement</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Our Leadership Team</h2>
                        <p className="mt-4 text-lg text-gray-500">
                            Dedicated professionals committed to transforming education through technology.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
                        {/* Team members would go here */}
                    </div>
                </div>
            </div>
        </div>
    );
} 