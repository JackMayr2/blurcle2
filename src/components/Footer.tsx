export default function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
                <div className="pb-8 mb-8 border-b border-gray-800">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-8 xl:col-span-1">
                            <div className="flex items-center space-x-3">
                                <div className="relative w-8 h-8">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md shadow-lg"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                                        B
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-white">Blurcle</span>
                            </div>
                            <p className="text-gray-400 text-base leading-relaxed">
                                Empowering education through seamless document management and collaboration.
                            </p>
                            <div className="flex space-x-6">
                                <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                        Solutions
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a href="/dashboard" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Dashboard
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/resources" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Resources
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/content-creation" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Content Creation
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="mt-12 md:mt-0">
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                        Support
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a href="#" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Help Center
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Documentation
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Contact
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                        Company
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a href="/about" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                About
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Blog
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Careers
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="mt-12 md:mt-0">
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                        Legal
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a href="#" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Privacy
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="text-base text-gray-400 hover:text-blue-400 transition-colors">
                                                Terms
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Blurcle. All rights reserved.
                    </p>
                    <p className="mt-4 text-sm text-gray-400 sm:mt-0">
                        Made with ❤️ for educators
                    </p>
                </div>
            </div>
        </footer>
    );
} 