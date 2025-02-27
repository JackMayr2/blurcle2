import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorMessage } from './ui/ErrorMessage';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);

        // Call the onError callback if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Render the fallback UI if provided, otherwise render the default error message
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorMessage
                    title="Something went wrong"
                    message={this.state.error?.message || 'An unexpected error occurred'}
                    onRetry={() => this.setState({ hasError: false, error: null })}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 