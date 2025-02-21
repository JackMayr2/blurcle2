'use client';
import React from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Menu } from '@headlessui/react';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="relative w-8 h-8">
                                <div className="absolute inset-0 bg-white rounded-full opacity-70 blur-sm"></div>
                                <div className="absolute inset-1 bg-blue-300 rounded-full opacity-60 blur-sm"></div>
                                <div className="absolute inset-2 bg-indigo-400 rounded-full opacity-50 blur-sm"></div>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Blurcle</span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-4 ml-10">
                            {session && (
                                <>
                                    <Link href="/dashboard" className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium">
                                        Dashboard
                                    </Link>
                                    <Link href="/district-profile" className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium">
                                        District Profile
                                    </Link>
                                    <Link href="/content-creation" className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium">
                                        Content Creation
                                    </Link>
                                </>
                            )}
                            <Link href="/resources" className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium">
                                Resources
                            </Link>
                            <Link href="/about" className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium">
                                About
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {session ? (
                            <div className="flex items-center space-x-4">
                                <img src={session.user?.image!} alt="Profile" className="h-8 w-8 rounded-full ring-2 ring-white" />
                                <Menu as="div" className="relative ml-3">
                                    <div>
                                        <Menu.Button className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-blue-50 text-sm font-medium">
                                            Settings
                                        </Menu.Button>
                                    </div>
                                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    href="/settings"
                                                    className={`${active ? 'bg-gray-100' : ''
                                                        } block px-4 py-2 text-sm text-gray-700`}
                                                >
                                                    Settings
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => signOut()}
                                                    className={`${active ? 'bg-gray-100' : ''
                                                        } block px-4 py-2 text-sm text-gray-700`}
                                                >
                                                    Sign Out
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </Menu.Items>
                                </Menu>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-blue-50 text-sm font-medium transition-colors"
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