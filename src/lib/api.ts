import { ApiResponse } from '@/types';

/**
 * Base API client for making fetch requests with proper error handling
 * 
 * @template T - The expected response data type
 * @param {string} url - The API endpoint URL
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<ApiResponse<T>>} - A promise that resolves to an ApiResponse
 */
export async function fetchApi<T = any>(
    url: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || `Error: ${response.status} ${response.statusText}`,
            };
        }

        return {
            success: true,
            data: data as T,
        };
    } catch (error) {
        console.error('API request failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Helper function for making GET requests
 * 
 * @template T - The expected response data type
 * @param {string} url - The API endpoint URL
 * @returns {Promise<ApiResponse<T>>} - A promise that resolves to an ApiResponse
 */
export async function get<T = any>(url: string): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, { method: 'GET' });
}

/**
 * Helper function for making POST requests
 * 
 * @template T - The expected response data type
 * @template D - The request data type
 * @param {string} url - The API endpoint URL
 * @param {D} [data] - The request body data
 * @returns {Promise<ApiResponse<T>>} - A promise that resolves to an ApiResponse
 */
export async function post<T = any, D = any>(
    url: string,
    data?: D
): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Helper function for making PUT requests
 * 
 * @template T - The expected response data type
 * @template D - The request data type
 * @param {string} url - The API endpoint URL
 * @param {D} [data] - The request body data
 * @returns {Promise<ApiResponse<T>>} - A promise that resolves to an ApiResponse
 */
export async function put<T = any, D = any>(
    url: string,
    data?: D
): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Helper function for making DELETE requests
 * 
 * @template T - The expected response data type
 * @param {string} url - The API endpoint URL
 * @returns {Promise<ApiResponse<T>>} - A promise that resolves to an ApiResponse
 */
export async function del<T = any>(url: string): Promise<ApiResponse<T>> {
    return fetchApi<T>(url, { method: 'DELETE' });
}

/**
 * API client object with all methods
 */
export const api = {
    get,
    post,
    put,
    delete: del,
    fetch: fetchApi,
}; 