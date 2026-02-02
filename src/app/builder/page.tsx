import BuilderForm from '@/components/BuilderForm';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function BuilderPage() {
    return (
        <div className="min-h-screen py-12 flex flex-col items-center bg-neutral">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 px-6">
                <div className="flex justify-center mb-6">
                    <Link href="/">
                        <img src="/logo.png" alt="QuickWeds Logo" className="h-24 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                </div>
                <p className="text-lg text-text-secondary max-w-md mx-auto italic font-serif">
                    Tell us about your special day and we&apos;ll handle the rest.
                </p>
            </div>
            <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                <BuilderForm />
            </Suspense>
        </div>
    );
}
