'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Bell, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { isNativeCapacitorApp } from '@/lib/capacitor';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const INSTALL_DISMISS_KEY = 'quickweds_install_prompt_dismissed_at';
const DISMISS_DAYS = 14;

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function wasRecentlyDismissed() {
  if (typeof window === 'undefined') return true;
  const dismissedAt = Number(window.localStorage.getItem(INSTALL_DISMISS_KEY) || 0);
  if (!dismissedAt) return false;
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export default function PWAInstaller() {
  const pathname = usePathname() || '';
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [notificationReady, setNotificationReady] = useState(false);

  const supportsInstall = useMemo(() => typeof window !== 'undefined' && 'serviceWorker' in navigator, []);

  useEffect(() => {
    if (pathname.startsWith('/embed/')) return;
    if (isNativeCapacitorApp()) return;
    if (!supportsInstall) return;

    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => undefined);

      if ('caches' in window) {
        void window.caches.keys()
          .then((keys) => Promise.all(keys.filter((key) => key.startsWith('quickweds-pwa-')).map((key) => window.caches.delete(key))))
          .catch(() => undefined);
      }
      return;
    }

    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
    window.setTimeout(() => {
      setIsStandalone(isStandaloneDisplay());
      setNotificationReady('Notification' in window && 'PushManager' in window);
    }, 0);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      if (!isStandaloneDisplay() && !wasRecentlyDismissed()) {
        window.setTimeout(() => setShowPrompt(true), 1800);
      }
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
      setShowPrompt(false);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [pathname, supportsInstall]);

  const dismiss = () => {
    window.localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
    setShowPrompt(false);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
    setShowPrompt(false);
  };

  if (pathname.startsWith('/embed/') || !supportsInstall || isStandalone || !showPrompt || !installPrompt) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-md pb-[var(--safe-area-inset-bottom)] sm:bottom-5">
      <div className="rounded-2xl border border-primary/20 bg-white/95 p-4 shadow-2xl shadow-primary/20 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-foreground">Install QuickWeds</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Add QuickWeds to your home screen for a faster app-like wedding workspace.
            </p>
            {notificationReady && (
              <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Bell className="h-3.5 w-3.5" />
                Notification ready
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-text-secondary transition hover:bg-neutral hover:text-foreground"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={install}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            Install App
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-neutral px-4 py-2 text-sm font-bold text-text-secondary transition hover:text-foreground"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
