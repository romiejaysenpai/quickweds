'use client';

import { useEffect, useRef, useState } from 'react';

const APP_DEMO_VIDEO_URL = '/demo/quickweds-app-demo.mp4';

export default function AppDemoVideo({ className = '', autoPlay = false }: { className?: string; autoPlay?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (typeof IntersectionObserver === 'undefined') {
            const timer = window.setTimeout(() => setShouldLoad(true), 0);
            return () => window.clearTimeout(timer);
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    if (autoPlay && videoRef.current) {
                        videoRef.current.muted = true;
                        void videoRef.current.play().catch(() => undefined);
                    }
                } else if (autoPlay && videoRef.current && !videoRef.current.paused) {
                    videoRef.current.pause();
                }
            },
            { rootMargin: '250px 0px', threshold: 0.1 }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, [autoPlay]);

    useEffect(() => {
        const video = videoRef.current;
        if (!shouldLoad || !autoPlay || !video) return;
        video.muted = true;
        void video.play().catch(() => {
            // Browser power-saving policies may still require the visible Play control.
        });
    }, [autoPlay, shouldLoad]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-[1.25rem] border border-white/20 bg-[#241b1e] shadow-2xl shadow-black/25 sm:rounded-[1.7rem] ${className}`}
        >
            <video
                ref={videoRef}
                className="aspect-video h-full w-full object-contain"
                controls
                playsInline
                muted={autoPlay}
                preload={shouldLoad ? 'metadata' : 'none'}
                aria-label="QuickWeds app walkthrough"
            >
                {shouldLoad && <source src={APP_DEMO_VIDEO_URL} type="video/mp4" />}
                Your browser does not support embedded videos. You can{' '}
                <a className="underline" href={APP_DEMO_VIDEO_URL}>download the QuickWeds app demo</a> instead.
            </video>
        </div>
    );
}
