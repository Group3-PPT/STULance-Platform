import React from 'react';

const Skeleton = ({ width, height, borderRadius, className, variant = 'rect', count = 1 }) => {
    const baseStyle = {
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || '8px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
    };

    if (variant === 'circle') {
        baseStyle.borderRadius = '50%';
    }

    const items = Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton-item ${className || ''}`} style={baseStyle} />
    ));

    return count === 1 ? items[0] : <>{items}</>;
};

export const SkeletonCard = ({ lines = 3, imageHeight = '180px' }) => (
    <div className="glass-card p-4" style={{ borderRadius: '16px' }}>
        {imageHeight && <Skeleton height={imageHeight} borderRadius="12px" />}
        <div className="mt-3 d-flex flex-column gap-2">
            <Skeleton height="14px" width="60%" />
            <Skeleton height="12px" width="80%" />
            {lines > 2 && <Skeleton height="12px" width="40%" />}
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="glass-card p-4" style={{ borderRadius: '16px' }}>
        {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="d-flex gap-3 mb-3 align-items-center">
                {Array.from({ length: cols }, (_, j) => (
                    <Skeleton 
                        key={j} 
                        height="16px" 
                        width={j === 0 ? '40%' : j === cols - 1 ? '20%' : '30%'} 
                    />
                ))}
            </div>
        ))}
    </div>
);

export default Skeleton;
