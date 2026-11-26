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
                className={`${className} flex items-center justify-center`}
                style={{
                    background:
                        'radial-gradient(circle at top, var(--invitation-subtle, var(--builder-subtle, rgba(255,255,255,0.85))), color-mix(in srgb, var(--invitation-motif, var(--primary, #D16C78)) 14%, transparent))',
                    ...style,
                }}
                role={alt ? 'img' : undefined}
                aria-label={alt ? `${alt} photo unavailable` : undefined}
                aria-hidden={alt ? undefined : true}
            >
                <span
                    className="flex h-16 w-16 items-center justify-center rounded-full border font-serif text-xl font-bold shadow-sm backdrop-blur"
                    style={{
                        borderColor: 'var(--invitation-border, var(--builder-border, rgba(209,108,120,0.3)))',
                        backgroundColor: 'var(--invitation-paper, var(--builder-paper, rgba(255,255,255,0.7)))',
                        color: 'var(--invitation-link, var(--builder-link, var(--primary, #D16C78)))',
                    }}
                    aria-hidden="true"
                >
                    {fallbackText || '♥'}
                </span>
            </div>
        );
    }

    return (
        // External wedding media and local blob previews cannot share a stable Next Image loader.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            decoding="async"
            {...imageProps}
            src={normalizedSrc}
            alt={alt}
            className={className}
            style={style}
            onError={() => setFailedSrc(normalizedSrc)}
        />
    );
}
