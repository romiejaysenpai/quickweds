'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { App } from '@capacitor/app';
import { BookOpen, Heart, LayoutDashboard, Plus, Settings, Store } from 'lucide-react';
import { isIosAppShell, isNativeAppShell } from '@/lib/capacitor';
import { getCachedSession } from '@/lib/session-cache';

const PUBLIC_PREFIXES = ['/w/', '/embed/', '/seat/', '/privacy', '/terms', '/cookies', '/support'];
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/auth/callback', '/onboarding/account-type'];

function shouldShowNativeTabs(pathname: string) {
  if (!pathname || pathname === '/') return false;
  if (AUTH_PATHS.some((path) => pathname.startsWith(path))) return false;
  if (PUBLIC_PREFIXES.some((path) => pathname.startsWith(path))) return false;
  return true;
}

export default function NativeAppChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const isNative = useMemo(() => isNativeAppShell(), []);
  const isIos = useMemo(() => isIosAppShell(), []);
  const currentPath = pathname || '';

  useEffect(() => {
    if (!isNative) return;

    const root = document.documentElement;
    root.dataset.nativeApp = 'true';
    root.dataset.nativePlatform = isIos ? 'ios' : 'native';
    root.classList.toggle('native-ios', isIos);
    root.classList.toggle('native-app', true);

    return () => {
      delete root.dataset.nativeApp;
      delete root.dataset.nativePlatform;
      root.classList.remove('native-ios', 'native-app');
    };
  }, [isIos, isNative]);

  useEffect(() => {
    if (!isNative) return;

    const root = document.documentElement;
    let cleanup: (() => void) | undefined;

    void App.addListener('appStateChange', ({ isActive }) => {
      root.dataset.appState = isActive ? 'active' : 'background';
    }).then((handle) => {
      cleanup = () => {
        void handle.remove();
      };
    });

    return () => cleanup?.();
  }, [isNative]);

  useEffect(() => {
    if (!isNative || currentPath !== '/') return;

    let cancelled = false;
    void getCachedSession().then(({ data }) => {
      if (cancelled) return;
      router.replace(data.session ? '/dashboard' : '/login');
    }).catch(() => {
      if (!cancelled) router.replace('/login');
    });

    return () => {
      cancelled = true;
    };
  }, [currentPath, isNative, router]);

  if (!isNative || !shouldShowNativeTabs(currentPath)) return null;

  const tabs = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard, active: currentPath.startsWith('/dashboard') },
    { href: '/builder', label: 'Create', icon: Plus, active: currentPath.startsWith('/builder') || currentPath.startsWith('/preview') },
    { href: '/suppliers', label: 'Vendors', icon: Store, active: currentPath.startsWith('/suppliers') },
    { href: '/user-guide', label: 'Guide', icon: BookOpen, active: currentPath.startsWith('/user-guide') },
    { href: '/settings', label: 'Settings', icon: Settings, active: currentPath.startsWith('/settings') },
  ];

  return (
    <nav className="native-tabbar" aria-label="QuickWeds app navigation">
      <div className="native-tabbar-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href} className={`native-tab ${tab.active ? 'is-active' : ''}`}>
              <span className="native-tab-icon">
                {tab.href === '/dashboard' ? <Heart className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
