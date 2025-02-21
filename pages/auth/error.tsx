import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AuthError() {
    const router = useRouter();
    const { error } = router.query;

    const errorMessages: { [key: string]: string } = {
        Configuration: "There is a problem with the server configuration.",
        AccessDenied: "You do not have permission to sign in.",
        Verification: "The verification link was invalid or has expired.",
        OAuthAccountNotLinked: "Email already exists with different sign-in method.",
        Default: "An error occurred during authentication."
    };

    const message = error ? errorMessages[error as string] || errorMessages.Default : errorMessages.Default;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Authentication Error
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {message}
                    </p>
                </div>
                <div className="mt-4 flex justify-center">
                    <Link
                        href="/auth/signin"
                        className="text-indigo-600 hover:text-indigo-500"
                    >
                        Try again
                    </Link>
                </div>
            </div>
        </div>
    );
} 