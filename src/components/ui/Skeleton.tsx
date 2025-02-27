import React, { memo } from 'react';
import { BaseProps } from '@/types';

interface SkeletonProps extends BaseProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = memo(({
    width = '100%',
    height = '1rem',
    borderRadius = '0.25rem',
    animate = true,
    className = '',
}) => {
    const widthStyle = typeof width === 'number' ? `${width}px` : width;
    const heightStyle = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`bg-gray-200 ${animate ? 'animate-pulse' : ''} ${className}`}
            style={{
                width: widthStyle,
                height: heightStyle,
                borderRadius,
            }}
            aria-hidden="true"
        />
    );
});

Skeleton.displayName = 'Skeleton';

export const SkeletonText: React.FC<SkeletonProps & { lines?: number }> = memo(({
    lines = 3,
    width = '100%',
    height = '1rem',
    className = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 && typeof width !== 'number' ? '70%' : width}
                    height={height}
                    {...props}
                />
            ))}
        </div>
    );
});

SkeletonText.displayName = 'SkeletonText';

export default Skeleton; 