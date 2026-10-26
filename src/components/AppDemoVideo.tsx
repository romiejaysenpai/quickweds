const APP_DEMO_VIDEO_URL = '/demo/quickweds-app-demo.mp4';

export default function AppDemoVideo({ className = '' }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden rounded-[1.25rem] border border-white/20 bg-[#241b1e] shadow-2xl shadow-black/25 sm:rounded-[1.7rem] ${className}`}>
            <video
                className="aspect-video h-full w-full object-contain"
                controls
                playsInline
                preload="metadata"
                aria-label="QuickWeds app walkthrough"
            >
                <source src={APP_DEMO_VIDEO_URL} type="video/mp4" />
                Your browser does not support embedded videos. You can{' '}
                <a className="underline" href={APP_DEMO_VIDEO_URL}>download the QuickWeds app demo</a> instead.
            </video>
        </div>
    );
}
