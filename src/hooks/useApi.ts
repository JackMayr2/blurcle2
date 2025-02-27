import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/types';

/**
 * Options for the useApi hook
 * 
 * @template T - The expected data type
 */
interface UseApiOptions<T> {
    /** Initial data to use before the API call completes */
    initialData?: T;
    /** Callback function to run when the API call succeeds */
    onSuccess?: (data: T) => void;
    /** Callback function to run when the API call fails */
    onError?: (error: string) => void;
    /** Whether to skip the initial fetch when using useFetch */
    skipInitialFetch?: boolean;
}

/**
 * Custom hook for data fetching with proper loading, error, and data states
 * 
 * @template T - The expected data type
 * @template E - The expected error type
 * @param {Function} apiFunction - The API function to call
 * @param {UseApiOptions<T>} options - Options for the hook
 * @returns {Object} - An object containing the data, error, loading state, and execute function
 */
export function useApi<T = any, E = any>(
    apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
    options: UseApiOptions<T> = {}
) {
    const [data, setData] = useState<T | undefined>(options.initialData);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Execute the API function with the given arguments
     * 
     * @param {...any} args - Arguments to pass to the API function
     * @returns {Promise<{success: boolean, data?: T, error?: string}>} - A promise that resolves to the result
     */
    const execute = useCallback(
        async (...args: any[]) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await apiFunction(...args);

                if (response.success && response.data) {
                    setData(response.data);
                    options.onSuccess?.(response.data);
                    return { success: true, data: response.data };
                } else {
                    const errorMessage = response.error || 'An unknown error occurred';
                    setError(errorMessage);
                    options.onError?.(errorMessage);
                    return { success: false, error: errorMessage };
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
                options.onError?.(errorMessage);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [apiFunction, options]
    );

    /**
     * Reset the hook state to its initial values
     */
    const reset = useCallback(() => {
        setData(options.initialData);
        setError(null);
        setIsLoading(false);
    }, [options.initialData]);

    return {
        data,
        error,
        isLoading,
        execute,
        setData,
        reset,
    };
}

/**
 * Custom hook for data fetching that automatically executes on mount
 * 
 * @template T - The expected data type
 * @param {Function} apiFunction - The API function to call
 * @param {UseApiOptions<T>} options - Options for the hook
 * @returns {Object} - An object containing the data, error, loading state, and execute function
 */
export function useFetch<T = any>(
    apiFunction: () => Promise<ApiResponse<T>>,
    options: UseApiOptions<T> = {}
) {
    const api = useApi<T>(apiFunction, options);

    useEffect(() => {
        if (!options.skipInitialFetch) {
            api.execute();
        }
    }, [api, options.skipInitialFetch]);

    return api;
}

export default useApi; 