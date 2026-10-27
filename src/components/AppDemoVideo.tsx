'use client';

import { useEffect, useRef } from 'react';

const APP_DEMO_VIDEO_URL = '/demo/quickweds-app-demo.mp4';

export default function AppDemoVideo({ className = '', autoPlay = false }: { className?: string; autoPlay?: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!autoPlay || !video) return;
        video.muted = true;
        // Request playback on page load, including when the player starts below the fold.
        void video.play().catch(() => {
            // Browser power-saving policies may still require the visible Play control.
        });
    }, [autoPlay]);

    return (
        <div className={`relative overflow-hidden rounded-[1.25rem] border border-white/20 bg-[#241b1e] shadow-2xl shadow-black/25 sm:rounded-[1.7rem] ${className}`}>
            <video
                ref={videoRef}
                className="aspect-video h-full w-full object-contain"
                controls
                playsInline
                autoPlay={autoPlay}
                muted={autoPlay}
                preload={autoPlay ? 'auto' : 'none'}
                aria-label="QuickWeds app walkthrough"
            >
                <source src={APP_DEMO_VIDEO_URL} type="video/mp4" />
                Your browser does not support embedded videos. You can{' '}
                <a className="underline" href={APP_DEMO_VIDEO_URL}>download the QuickWeds app demo</a> instead.
            </video>
        </div>
    );
}
