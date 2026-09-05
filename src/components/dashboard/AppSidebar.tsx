'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Heart,
    Sparkles,
    ExternalLink,
    ListTodo,
    Bell,
    CheckCircle2,
    QrCode,
    Camera,
    Mail,
    MapPin,
    BookOpen,
    Settings,
    LifeBuoy,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Check,
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getWeddingPublicPath } from '@/lib/wedding-slugs';

interface AppSidebarProps {
    weddingId?: string;
    weddingTitle?: string;
    weddingSlug?: string | null;
    weddings?: Array<{ id: string; bride_name?: string; groom_name?: string; couple_name?: string; public_slug?: string }>;
    canManageWorkspace?: boolean;
}

export default function AppSidebar({
    weddingId: propWeddingId,
    weddingTitle,
    weddingSlug,
    weddings = [],
    canManageWorkspace = true,
}: AppSidebarProps) {
    const pathname = usePathname() || '';
    const params = useParams<{ id?: string }>();
    const router = useRouter();
    const { user, logout } = useAuth();

    const activeWeddingId = propWeddingId || params?.id || '';

    // Collapsible state persisted in localStorage for desktop UX
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem('qw_desktop_sidebar_collapsed');
        if (stored !== null) {
            setIsCollapsed(stored === 'true');
        }
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('qw_desktop_sidebar_collapsed', String(next));
            return next;
        });
    };

    const userFullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'My Account';
    const userInitials = userFullName
        .split(/\s+/)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'QW';

    const currentWedding = useMemo(() => {
        if (!activeWeddingId) return null;
        return weddings.find((w) => w.id === activeWeddingId) || null;
    }, [weddings, activeWeddingId]);

    const activeWeddingDisplayName = weddingTitle || (currentWedding ? (
        currentWedding.couple_name ||
        `${currentWedding.bride_name || 'Bride'} & ${currentWedding.groom_name || 'Groom'}`
    ) : 'Wedding Workspace');

    const guestViewUrl = weddingSlug
        ? getWeddingPublicPath({ id: activeWeddingId, public_slug: weddingSlug })
        : (currentWedding ? getWeddingPublicPath(currentWedding) : (activeWeddingId ? `/w/${activeWeddingId}` : null));

    type SidebarNavItem = {
        label: string;
        href: string;
        icon: typeof LayoutDashboard;
        isActive: boolean;
        isExternal?: boolean;
    };

    // Nav Groups
    const workspaceNav = useMemo<SidebarNavItem[]>(() => {
        const items: SidebarNavItem[] = [
            {
                label: 'All Weddings',
                href: '/dashboard',
                icon: LayoutDashboard,
                isActive: pathname === '/dashboard',
            },
        ];

        if (activeWeddingId) {
            items.push({
                label: 'Workspace Overview',
                href: `/dashboard/${activeWeddingId}`,
                icon: Heart,
                isActive: pathname === `/dashboard/${activeWeddingId}`,
            });

            if (canManageWorkspace) {
                items.push({
                    label: 'Website Builder',
                    href: `/builder?edit=${activeWeddingId}`,
                    icon: Sparkles,
                    isActive: pathname.startsWith('/builder') && pathname.includes(activeWeddingId),
                });
            }

            if (guestViewUrl) {
                items.push({
                    label: 'Live Guest View',
                    href: guestViewUrl,
                    icon: ExternalLink,
                    isActive: false,
                    isExternal: true,
                });
            }
        }

        return items;
    }, [pathname, activeWeddingId, canManageWorkspace, guestViewUrl]);

    const toolsNav = useMemo(() => {
        if (!activeWeddingId) return [];

        return [
            {
                label: 'Wedding Planner',
                href: `/dashboard/${activeWeddingId}/planner`,
                icon: ListTodo,
                isActive: pathname.includes(`/dashboard/${activeWeddingId}/planner`),
            },
            {
                label: 'Wedding Day Mode',
                href: `/dashboard/${activeWeddingId}/wedding-day?from=dashboard`,
                icon: Bell,
                isActive: pathname.includes(`/dashboard/${activeWeddingId}/wedding-day`),
            },
            {
                label: 'Guest Check-In',
                href: `/dashboard/${activeWeddingId}/check-in`,
                icon: CheckCircle2,
                isActive: pathname.includes(`/dashboard/${activeWeddingId}/check-in`),
            },
            {
                label: 'QR Kit & Printables',
                href: `/dashboard/${activeWeddingId}/qr-kit?from=dashboard`,
                icon: QrCode,
                isActive: pathname.includes(`/dashboard/${activeWeddingId}/qr-kit`),
            },
            {
                label: 'Photo Uploads',
                href: `/dashboard/${activeWeddingId}/photo-uploads`,
                icon: Camera,
                isActive: pathname.includes(`/dashboard/${activeWeddingId}/photo-uploads`),
            },
            {
                label: 'Thank-You Notes',
                href: `/dashboard/${activeWeddingId}/thank-you?from=dashboard`,
                icon: Mail,
                isActive: pathname.includes(`/dashboard/${activeWeddingId}/thank-you`),
            },
        ];
    }, [pathname, activeWeddingId]);

    const generalNav = useMemo(() => {
        return [
            {
                label: 'Supplier Directory',
                href: '/suppliers',
                icon: MapPin,
                isActive: pathname.startsWith('/suppliers'),
            },
            {
                label: 'User Guide',
                href: '/user-guide',
                icon: BookOpen,
                isActive: pathname.startsWith('/user-guide'),
            },
            {
                label: 'Account Settings',
                href: '/settings',
                icon: Settings,
                isActive: pathname.startsWith('/settings'),
            },
            {
                label: 'Help & Support',
                href: '/support',
                icon: LifeBuoy,
                isActive: pathname.startsWith('/support'),
            },
        ];
    }, [pathname]);

    return (
        <aside
            className={`hidden md:flex flex-col h-screen sticky top-0 bg-white/95 backdrop-blur-md border-r border-border z-40 transition-all duration-300 select-none ${
                isCollapsed ? 'w-[76px]' : 'w-[268px]'
            }`}
        >
            {/* Header: Brand Logo & Visible Collapse Toggle */}
            {!isCollapsed ? (
                <div className="flex items-center justify-between h-18 px-4 py-3.5 border-b border-border/80 shrink-0 bg-white">
                    <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90 min-w-0" aria-label="QuickWeds Home">
                        <img
                            src="/icon.png"
                            alt="QuickWeds Logo"
                            className="h-9.5 w-9.5 rounded-xl object-contain shadow-xs shrink-0 transition-transform group-hover:scale-105"
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="font-serif text-xl font-bold tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
                                QuickWeds
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-primary/80 leading-none">
                                Workspace
                            </span>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={toggleCollapse}
                        title="Collapse sidebar to icon mode"
                        aria-label="Collapse sidebar"
                        className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-border bg-neutral/70 text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                        <PanelLeftClose className="w-4.5 h-4.5 text-text-secondary group-hover:text-primary" />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-3 px-2 border-b border-border/80 shrink-0 bg-white">
                    <Link href="/" className="flex items-center justify-center group" aria-label="QuickWeds Home" title="QuickWeds Landing Page">
                        <img src="/icon.png" alt="QuickWeds" className="w-9.5 h-9.5 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform" />
                    </Link>

                    <button
                        type="button"
                        onClick={toggleCollapse}
                        title="Expand sidebar (show titles)"
                        aria-label="Expand sidebar"
                        className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-border bg-neutral/70 text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                        <PanelLeftOpen className="w-4.5 h-4.5 text-primary" />
                    </button>
                </div>
            )}

            {/* Contextual Workspace Switcher (if in wedding workspace or multiple weddings exist) */}
            {activeWeddingId && !isCollapsed && (
                <div className="p-3 border-b border-border/60 bg-neutral/40">
                    <div className="relative">
                        {weddings.length > 1 ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                                    className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-border/80 hover:border-primary/40 text-left transition-all shadow-xs"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <Heart className="w-3.5 h-3.5 fill-current" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary/70">Workspace</p>
                                            <p className="text-xs font-bold text-foreground truncate">{activeWeddingDisplayName}</p>
                                        </div>
                                    </div>
                                    <ChevronsUpDown className="w-4 h-4 text-text-secondary/60 shrink-0" />
                                </button>

                                <AnimatePresence>
                                    {isSwitcherOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setIsSwitcherOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-border shadow-xl p-1.5 max-h-56 overflow-y-auto space-y-1"
                                            >
                                                <p className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-text-secondary/60">Switch Workspace</p>
                                                {weddings.map((w) => {
                                                    const isCur = w.id === activeWeddingId;
                                                    const name = w.couple_name || `${w.bride_name || 'Bride'} & ${w.groom_name || 'Groom'}`;
                                                    return (
                                                        <button
                                                            key={w.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setIsSwitcherOpen(false);
                                                                router.push(`/dashboard/${w.id}`);
                                                            }}
                                                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all text-left ${
                                                                isCur ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-neutral hover:text-foreground'
                                                            }`}
                                                        >
                                                            <span className="truncate">{name}</span>
                                                            {isCur && <Check className="w-3.5 h-3.5 shrink-0" />}
                                                        </button>
                                                    );
                                                })}
                                                <div className="border-t border-border/60 pt-1 mt-1">
                                                    <Link
                                                        href="/builder"
                                                        onClick={() => setIsSwitcherOpen(false)}
                                                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>New Wedding</span>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-border/70 shadow-xs">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Heart className="w-3.5 h-3.5 fill-current" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-text-secondary/60">Active Workspace</p>
                                    <p className="text-xs font-bold text-foreground truncate">{activeWeddingDisplayName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Navigation Scroll Area */}
            <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin">
                {/* Group 1: Workspace */}
                <div>
                    {!isCollapsed && (
                        <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary/60">
                            Workspace
                        </p>
                    )}
                    <div className="space-y-1">
                        {workspaceNav.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    target={item.isExternal ? '_blank' : undefined}
                                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                                        isCollapsed ? 'justify-center px-0' : ''
                                    } ${
                                        item.isActive
                                            ? 'bg-primary text-white font-bold shadow-md shadow-primary/20 scale-[1.01]'
                                            : 'text-text-secondary hover:bg-neutral/80 hover:text-foreground'
                                    }`}
                                >
                                    <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform ${item.isActive ? 'text-white' : 'text-text-secondary/80 group-hover:text-primary'}`} />
                                    {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
                                    {!isCollapsed && item.isExternal && (
                                        <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40 shrink-0" />
                                    )}
                                    {isCollapsed && item.isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-md bg-primary" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Group 2: Planning Tools (Only in wedding context) */}
                {toolsNav.length > 0 && (
                    <div>
                        {!isCollapsed && (
                            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary/60">
                                Planning Tools
                            </p>
                        )}
                        <div className="space-y-1">
                            {toolsNav.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                                            isCollapsed ? 'justify-center px-0' : ''
                                        } ${
                                            item.isActive
                                                ? 'bg-primary text-white font-bold shadow-md shadow-primary/20 scale-[1.01]'
                                                : 'text-text-secondary hover:bg-neutral/80 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform ${item.isActive ? 'text-white' : 'text-text-secondary/80 group-hover:text-primary'}`} />
                                        {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
                                        {isCollapsed && item.isActive && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-md bg-primary" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Group 3: Resources & Account */}
                <div>
                    {!isCollapsed && (
                        <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary/60">
                            Resources & Account
                        </p>
                    )}
                    <div className="space-y-1">
                        {generalNav.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                                        isCollapsed ? 'justify-center px-0' : ''
                                    } ${
                                        item.isActive
                                            ? 'bg-primary text-white font-bold shadow-md shadow-primary/20 scale-[1.01]'
                                            : 'text-text-secondary hover:bg-neutral/80 hover:text-foreground'
                                    }`}
                                >
                                    <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform ${item.isActive ? 'text-white' : 'text-text-secondary/80 group-hover:text-primary'}`} />
                                    {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
                                    {isCollapsed && item.isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-md bg-primary" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Footer: User Profile & Log Out */}
            <div className="p-3 border-t border-border/80 bg-neutral/30 shrink-0">
                {!isCollapsed ? (
                    <div className="flex items-center justify-between gap-2">
                        <Link href="/settings" className="flex items-center gap-2.5 min-w-0 group hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {userInitials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{userFullName}</p>
                                <p className="text-[10px] text-text-secondary/70 truncate">{user?.email || 'Logged in'}</p>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => logout()}
                            title="Sign out"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-white text-text-secondary hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors shadow-xs shrink-0"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Link
                            href="/settings"
                            title={userFullName}
                            className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs hover:opacity-80 transition-opacity"
                        >
                            {userInitials}
                        </Link>
                        <button
                            type="button"
                            onClick={() => logout()}
                            title="Sign out"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/80 bg-white text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
