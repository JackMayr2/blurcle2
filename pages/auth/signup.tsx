'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import type { UserRole } from '../../types/auth';
import LoadingSpinner from '../../components/LoadingSpinner';

interface ExtendedSession {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id: string;
        role?: string | null;
        tier?: string | null;
        onboardingComplete?: boolean;
        organizationName?: string | null;
    };
}

export default function SignUp() {
    const { data: session, status, update: updateSession } = useSession() as { data: ExtendedSession | null, status: string, update: () => Promise<ExtendedSession | null> };
    const router = useRouter();
    const [role, setRole] = useState<UserRole>();
    const [organizationName, setOrganizationName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        // If user is already signed in and has completed onboarding, redirect them
        if (status === 'authenticated' && session?.user?.onboardingComplete) {
            console.log('User already completed onboarding, redirecting...');
            const redirectUrl = session.user.role === 'district' ? '/district-profile' : '/dashboard';
            window.location.assign(redirectUrl);
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        // Show loading state immediately
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300';
        loadingOverlay.innerHTML = `
            <div class="text-center">
                <div class="inline-block">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
                <p class="mt-4 text-sm text-gray-600">Completing your signup...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);

        try {
            const response = await fetch('/api/user/complete-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    role,
                    organizationName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to complete signup');
            }

            const updatedSession = await updateSession();

            if (!updatedSession?.user?.onboardingComplete) {
                throw new Error('Session not updated properly');
            }

            // Add opacity transition before redirect
            loadingOverlay.style.opacity = '1';
            await new Promise(resolve => setTimeout(resolve, 300));

            const redirectUrl = role === 'district' ? '/district-profile' : '/dashboard';
            window.location.href = redirectUrl;

        } catch (error) {
            console.error('Signup error:', error);
            setError(error instanceof Error ? error.message : 'Failed to complete signup');
            setIsSubmitting(false);
            // Remove loading overlay on error
            document.body.removeChild(loadingOverlay);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Complete Your Profile
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Tell us a bit more about yourself
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                I am a...
                            </label>
                            <div className="mt-2 space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('district')}
                                    className={`w-full py-2 px-4 border rounded-md ${role === 'district'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    School District Representative
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('consultant')}
                                    className={`w-full py-2 px-4 border rounded-md ${role === 'consultant'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Educational Consultant
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                                Organization Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="organizationName"
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={!role || !organizationName || isSubmitting}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!role || !organizationName || isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <LoadingSpinner className="w-4 h-4 mr-2" />
                                        Completing Signup...
                                    </span>
                                ) : (
                                    'Complete Signup'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 