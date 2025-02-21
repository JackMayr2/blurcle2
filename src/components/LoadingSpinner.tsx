'use client';
import React from 'react';

interface LoadingSpinnerProps {
    className?: string;
}

export default function LoadingSpinner({ className = "h-8 w-8" }: LoadingSpinnerProps) {
    return (
        <div className="flex justify-center items-center animate-fade-in">
            <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${className}`}></div>
        </div>
    );
} 