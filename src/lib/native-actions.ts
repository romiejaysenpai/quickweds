'use client';

import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { isNativeAppShell } from '@/lib/capacitor';

export async function openExternalUrl(url: string) {
    if (!url) return;

    if (isNativeAppShell() && /^https?:\/\//i.test(url)) {
        await Browser.open({
            url,
            presentationStyle: 'popover',
        });
        return;
    }

    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
        window.location.href = url;
    }
}

export async function shareTextOrUrl({
    title,
    text,
    url,
    dialogTitle,
}: {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
}) {
    if (isNativeAppShell()) {
        await Share.share({ title, text, url, dialogTitle });
        return;
    }

    if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
    }

    if (url) {
        await navigator.clipboard?.writeText(url);
    }
}
