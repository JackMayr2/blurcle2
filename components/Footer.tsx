export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">SchoolDrive</h3>
                        <p className="text-gray-300">
                            Empowering education through seamless document management and collaboration.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a></li>
                            <li><a href="/resources" className="text-gray-300 hover:text-white">Resources</a></li>
                            <li><a href="/about" className="text-gray-300 hover:text-white">About</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Documentation</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                    <p className="text-gray-300">&copy; {new Date().getFullYear()} SchoolDrive. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
} 