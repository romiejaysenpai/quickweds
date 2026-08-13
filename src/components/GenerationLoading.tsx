'use client';

import LoadingState from './ui/LoadingState';

export default function GenerationLoading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral/95 px-4 backdrop-blur-xl">
            <LoadingState
                variant="panel"
                label="Creating your wedding website…"
                description="We’re arranging your details into a design made for your day."
                className="max-w-md"
            />
        </div>
    );
}
