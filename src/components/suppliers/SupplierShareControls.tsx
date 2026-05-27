'use client';

import { useState } from 'react';
import { CheckCheck, Copy, Share2 } from 'lucide-react';
import { copyToClipboard } from '@/lib/client-clipboard';
import { shareTextOrUrl } from '@/lib/native-actions';

export default function SupplierShareControls({
    slug,
    businessName,
    className = '',
}: {
    slug: string;
    businessName: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    const getShareUrl = () => `${window.location.origin}/suppliers/${slug}`;

    const copyLink = async () => {
        try {
            await copyToClipboard(getShareUrl());
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const shareProfile = async () => {
        const url = getShareUrl();
        try {
            await shareTextOrUrl({
                title: `${businessName} | QuickWeds Suppliers`,
                text: `View ${businessName} on QuickWeds.`,
                url,
                dialogTitle: 'Share supplier profile',
            });
        } catch {
            // User cancellation should not show an error state.
        }
    };

    return (
        <div className={`flex flex-col gap-2 sm:flex-row ${className}`}>
            <button
                type="button"
                onClick={shareProfile}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
            >
                <Share2 className="h-4 w-4" />
                Share Profile
            </button>
            <button
                type="button"
                onClick={copyLink}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5"
            >
                {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Link'}
            </button>
        </div>
    );
}
