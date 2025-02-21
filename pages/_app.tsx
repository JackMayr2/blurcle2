import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Navbar, Footer } from '@/components';
import '@/styles/globals.css';

export default function App({
    Component,
    pageProps: { session, ...pageProps }
}: AppProps) {
    return (
        <SessionProvider session={session}>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                    <Component {...pageProps} />
                </main>
                <Footer />
            </div>
        </SessionProvider>
    );
} 