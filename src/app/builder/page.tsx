import BuilderForm from '@/components/BuilderForm';
import WeddingFontProvider from '@/components/WeddingFontProvider';
import LoadingState from '@/components/ui/LoadingState';
import Link from 'next/link';
import { Suspense } from 'react';

export default function BuilderPage() {
    return (
        <WeddingFontProvider>
        <div className="mobile-safe-screen mobile-safe-px mobile-safe-bottom py-6 sm:py-12 flex flex-col items-center bg-neutral">
            <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 px-2 sm:px-6">
                <div className="flex justify-center mb-4 sm:mb-6">
                    <Link href="/">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-16 sm:h-24 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                </div>
                <p className="text-sm sm:text-lg text-text-secondary max-w-md mx-auto italic font-serif">
                    Tell us about your special day and we&apos;ll handle the rest.
                </p>
            </div>
            <Suspense fallback={<LoadingState variant="panel" label="Preparing your builder…" className="max-w-6xl" />}>
                <BuilderForm />
            </Suspense>
        </div>
        </WeddingFontProvider>
    );
}
