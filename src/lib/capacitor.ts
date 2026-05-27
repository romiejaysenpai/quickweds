'use client';

import { Capacitor } from '@capacitor/core';

export function isNativeCapacitorApp() {
    return Capacitor.isNativePlatform();
}

export function isIosCapacitorApp() {
    return isNativeCapacitorApp() && Capacitor.getPlatform() === 'ios';
}

export function isNativeAppPreview() {
    return process.env.NODE_ENV !== 'production'
        && typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('nativePreview') === '1';
}

export function isNativeAppShell() {
    return isNativeAppPreview() || isNativeCapacitorApp();
}

export function isIosAppShell() {
    return isNativeAppPreview() || isIosCapacitorApp();
}
