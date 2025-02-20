import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold text-indigo-600">SchoolDrive</span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-4 ml-10">
                            {session && (
                                <>
                                    <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                                        Dashboard
                                    </Link>
                                    <Link href="/district-profile" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                                        District Profile
                                    </Link>
                                </>
                            )}
                            <Link href="/resources" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                                Resources
                            </Link>
                            <Link href="/about" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                                About
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {session ? (
                            <div className="flex items-center space-x-4">
                                <img src={session.user?.image!} alt="Profile" className="h-8 w-8 rounded-full" />
                                <button
                                    onClick={() => signOut()}
                                    className="text-gray-700 hover:text-indigo-600 px-3 py-2"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 