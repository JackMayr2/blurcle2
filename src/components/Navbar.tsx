'use client';
import React from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Menu } from '@headlessui/react';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-blue-600">Blurcle</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {session && (
                            <>
                                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                                    Dashboard
                                </Link>
                                <Link href="/district-profile" className="text-gray-600 hover:text-blue-600">
                                    District Profile
                                </Link>
                                <Link href="/content-creation" className="text-gray-600 hover:text-blue-600">
                                    Content Creation
                                </Link>
                            </>
                        )}
                        <Link href="/resources" className="text-gray-600 hover:text-blue-600">
                            Resources
                        </Link>
                        <Link href="/about" className="text-gray-600 hover:text-blue-600">
                            About
                        </Link>
                    </div>

                    {/* Auth Button */}
                    <div className="flex items-center">
                        {session ? (
                            <Menu as="div" className="relative">
                                <Menu.Button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    Menu
                                </Menu.Button>
                                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link href="/settings"
                                                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-gray-700`}>
                                                Settings
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => signOut()}
                                                className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-gray-700`}>
                                                Sign Out
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Menu>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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