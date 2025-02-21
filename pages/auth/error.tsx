import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ErrorPage() {
    const router = useRouter();
    const { error } = router.query;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Authentication Error
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {error || 'An error occurred during authentication'}
                </p>
                <div className="mt-8 text-center">
                    <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    );
} 