import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SignIn() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const { callbackUrl } = router.query;

    const handleSignIn = async () => {
        try {
            const result = await signIn('google', {
                callbackUrl: callbackUrl as string || '/dashboard',
                redirect: false
            });

            if (result?.error) {
                setError(result.error);
            }
        } catch (error) {
            console.error('Sign in error:', error);
            setError('An error occurred during sign in');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    {error && (
                        <div className="mt-2 text-center text-red-600">
                            {error === 'AccessDenied' ? 'Access denied. Please try again.' : 'An error occurred.'}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSignIn}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    );
} 