import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Navbar, Footer } from '@/components';
import '@/styles/globals.css';
import { Session } from 'next-auth';

function MyApp({
    Component,
    pageProps: { session, ...pageProps }
}: AppProps<{ session: Session }>) {
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

export default MyApp; 