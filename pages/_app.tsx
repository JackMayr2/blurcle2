import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/globals.css';
import AuthWrapper from '../components/auth/AuthWrapper';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <AuthWrapper>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                        <Component {...pageProps} />
                    </main>
                    <Footer />
                </div>
            </AuthWrapper>
        </SessionProvider>
    );
} 