'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import SignUpFlow from '@/components/auth/SignUpFlow';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SignUp() {
    const { data: session, status, update: updateSession } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        // If user has a complete profile, redirect them
        if (status === 'authenticated' && session?.user?.onboardingComplete) {
            const redirectUrl = session.user.role === 'district' ? '/district-profile' : '/dashboard';
            router.replace(redirectUrl);
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    const handleCompleteSignup = async (role: string, organizationName: string) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/user/complete-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role,
                    organizationName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Failed to complete signup');
            }

            // Update the session with the new user data
            await updateSession({
                user: {
                    ...session?.user,
                    role: data.user.role,
                    organizationName: data.user.organizationName,
                    onboardingComplete: data.user.onboardingComplete
                }
            });

            // Wait for session update to complete
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if session was updated correctly
            const updatedSession = await fetch('/api/auth/session');
            const sessionData = await updatedSession.json();

            console.log('Updated session data:', sessionData);

            if (sessionData?.user?.onboardingComplete) {
                // Use router for client-side navigation if session is updated
                const redirectUrl = role === 'district' ? '/district-profile' : '/dashboard';
                router.push(redirectUrl);
            } else {
                // Fall back to hard redirect if session isn't updated
                const redirectUrl = role === 'district' ? '/district-profile' : '/dashboard';
                window.location.href = redirectUrl;
            }

        } catch (error) {
            console.error('Signup error:', error);
            setError(error instanceof Error ? error.message : 'Failed to complete signup');
            setIsSubmitting(false);
        }
    };

    // Determine if this is a first-time user or someone completing their profile
    const isFirstTimeUser = !session?.user?.role && !session?.user?.organizationName;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isFirstTimeUser ? 'Welcome to Blurcle!' : 'Complete Your Profile'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isFirstTimeUser
                        ? "Let's get you set up with your account"
                        : 'Please provide the missing information to continue'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <SignUpFlow
                        onComplete={handleCompleteSignup}
                        isSubmitting={isSubmitting}
                        initialRole={session?.user?.role || undefined}
                        initialOrganization={session?.user?.organizationName || undefined}
                    />
                </div>
            </div>
        </div>
    );
} 