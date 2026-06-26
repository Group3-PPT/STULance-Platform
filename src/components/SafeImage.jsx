import React, { useState } from 'react';
import { User, Building2 } from 'lucide-react';

const SafeImage = ({ src, alt, className, fallbackType = 'user', style, ...props }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    if (error || !src) {
        if (fallbackType === 'business') {
            return (
                <div className={`safe-image-fallback safe-image-business ${className || ''}`} style={style}>
                    <Building2 size={24} />
                </div>
            );
        }
        return (
            <div className={`safe-image-fallback safe-image-user ${className || ''}`} style={style}>
                <User size={24} />
            </div>
        );
    }

    return (
        <>
            {loading && (
                <div className={`safe-image-fallback safe-image-loading ${className || ''}`} style={style}>
                    <div className="safe-image-spinner"></div>
                </div>
            )}
            <img
                src={src}
                alt={alt || ''}
                className={className}
                style={{ ...style, display: loading ? 'none' : 'block' }}
                onLoad={() => setLoading(false)}
                onError={() => { setError(true); setLoading(false); }}
                {...props}
            />
        </>
    );
};

export default SafeImage;
