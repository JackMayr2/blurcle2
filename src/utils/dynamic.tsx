import React, { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DynamicImportOptions {
    loading?: ComponentType;
    ssr?: boolean;
}

/**
 * Utility function for dynamically importing components with Suspense
 * @param importFunc - Dynamic import function
 * @param options - Options for the dynamic import
 * @returns Lazy loaded component
 */
export function dynamicImport<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    options: DynamicImportOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
    const LazyComponent = lazy(importFunc);
    const { loading: LoadingComponent = DefaultLoading, ssr = true } = options;

    // If SSR is disabled, return a client-only component
    if (!ssr) {
        return (props: React.ComponentProps<T>) => {
            const [isMounted, setIsMounted] = React.useState(false);

            React.useEffect(() => {
                setIsMounted(true);
            }, []);

            if (!isMounted) {
                return <LoadingComponent />;
            }

            return (
                <Suspense fallback={<LoadingComponent />}>
                    <LazyComponent {...props} />
                </Suspense>
            );
        };
    }

    // For SSR-enabled components
    return (props: React.ComponentProps<T>) => (
        <Suspense fallback={<LoadingComponent />}>
            <LazyComponent {...props} />
        </Suspense>
    );
}

// Default loading component
const DefaultLoading: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <LoadingSpinner />
    </div>
);

