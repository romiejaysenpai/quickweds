'use client';

import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

type SafeWeddingImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onError'> & {
    src?: string | null;
    alt: string;
    fallbackText?: string;
};

export default function SafeWeddingImage({
    src,
    alt,
    className = '',
    fallbackText = '♥',
    style,
    ...imageProps
}: SafeWeddingImageProps) {
    const normalizedSrc = String(src || '').trim();
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const showFallback = !normalizedSrc || failedSrc === normalizedSrc;

    if (showFallback) {
        return (
            <div
                className={`${className} flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(209,108,120,0.18))]`}
                style={style}
                role={alt ? 'img' : undefined}
                aria-label={alt ? `${alt} photo unavailable` : undefined}
                aria-hidden={alt ? undefined : true}
            >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/65 font-serif text-xl font-bold text-primary/70 shadow-sm backdrop-blur" aria-hidden="true">
                    {fallbackText || '♥'}
                </span>
            </div>
        );
    }

    return (
        // External wedding media and local blob previews cannot share a stable Next Image loader.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            {...imageProps}
            src={normalizedSrc}
            alt={alt}
            className={className}
            style={style}
            onError={() => setFailedSrc(normalizedSrc)}
        />
    );
}
