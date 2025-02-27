'use client';
import React from 'react';
import { BaseProps } from '@/types';

type LoadingSpinnerProps = BaseProps;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    className = "h-8 w-8"
}) => {
    return (
        <div className="flex justify-center items-center animate-fade-in">
            <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${className}`}></div>
        </div>
    );
};

export default LoadingSpinner; 