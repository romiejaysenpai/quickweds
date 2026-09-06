'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { RSVP_EMBED_RESIZE_MESSAGE } from '@/lib/rsvp-embed';

export default function RsvpEmbedAutoHeight({ children }: { children: ReactNode }) {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        let animationFrame = 0;
        let lastHeight = 0;

        const reportHeight = () => {
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(() => {
                const height = Math.ceil(Math.max(content.scrollHeight, content.getBoundingClientRect().height));
                if (height <= 0 || Math.abs(height - lastHeight) < 2) return;

                lastHeight = height;
                window.parent.postMessage({ type: RSVP_EMBED_RESIZE_MESSAGE, height }, '*');
            });
        };

        const resizeObserver = new ResizeObserver(reportHeight);
        resizeObserver.observe(content);
        window.addEventListener('resize', reportHeight);
        void document.fonts?.ready.then(reportHeight);
        reportHeight();

        return () => {
            cancelAnimationFrame(animationFrame);
            resizeObserver.disconnect();
            window.removeEventListener('resize', reportHeight);
        };
    }, []);

    return <div ref={contentRef} data-rsvp-embed-content>{children}</div>;
}
