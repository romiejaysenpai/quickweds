'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Bell,
    Check,
    Trash2,
    Info,
    MessageSquare,
    Users,
    Sparkles,
    X,
    ChevronDown,
    ChevronUp,
    Clock,
    ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'rsvp' | 'system' | 'team' | 'info';
    is_read: boolean;
    link: string | null;
    created_at: string;
};

function formatNotificationDate(dateStr: string) {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        if (isToday) return `Today at ${timeStr}`;
        return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${timeStr}`;
    } catch {
        return dateStr;
    }
}

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        const { data, error } = await (supabase as any)
            .from('user_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30);

        if (!error && data) {
            setNotifications(data as Notification[]);
            setUnreadCount((data as Notification[]).filter((n) => !n.is_read).length);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const refreshTimer = window.setTimeout(() => {
            fetchNotifications();
        }, 0);

        // Real-time subscription
        const channel = supabase
            .channel('user_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'user_notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setNotifications((prev) => [payload.new as Notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            )
            .subscribe();

        return () => {
            window.clearTimeout(refreshTimer);
            supabase.removeChannel(channel);
        };
    }, [fetchNotifications, user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        const { error } = await (supabase as any)
            .from('user_notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
            setUnreadCount((prev) => Math.max(0, prev - 1));
            if (selectedNotification?.id === id) {
                setSelectedNotification((prev) => (prev ? { ...prev, is_read: true } : null));
            }
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const { error } = await (supabase as any)
            .from('user_notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error) {
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    const deleteNotification = async (id: string) => {
        const { error } = await (supabase as any)
            .from('user_notifications')
            .delete()
            .eq('id', id);

        if (!error) {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            const wasUnread = notifications.find((n) => n.id === id)?.is_read === false;
            if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
            if (selectedNotification?.id === id) {
                setSelectedNotification(null);
            }
        }
    };

    const toggleExpand = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const openNotificationDetail = (n: Notification) => {
        setSelectedNotification(n);
        if (!n.is_read) {
            void markAsRead(n.id);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'rsvp':
                return <Users className="w-4 h-4 text-emerald-500" />;
            case 'team':
                return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'system':
                return <Sparkles className="w-4 h-4 text-amber-500" />;
            default:
                return <Info className="w-4 h-4 text-primary" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'rsvp':
                return 'RSVP Update';
            case 'team':
                return 'Collaborator';
            case 'system':
                return 'Product Update';
            default:
                return 'Notification';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl border border-border bg-white hover:bg-neutral transition-all group"
                aria-label="Notifications"
            >
                <Bell
                    className={`w-5 h-5 transition-colors ${
                        unreadCount > 0 ? 'text-red-500 animate-ring' : 'text-text-secondary/60'
                    }`}
                />
                {unreadCount > 0 && (
                    <>
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-lg shadow-red-500/40 ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </>
                )}
            </button>

            {/* Mobile backdrop for dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[190] sm:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-[74px] sm:top-full sm:mt-3 sm:w-[420px] max-w-[500px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-border z-[200] overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[540px]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-neutral/30 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-serif font-bold text-foreground text-base">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllAsRead}
                                        className="text-[11px] font-bold text-primary hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-lg text-text-secondary/60 hover:text-foreground hover:bg-neutral sm:hidden"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-border/50 overscroll-contain">
                            {notifications.length > 0 ? (
                                notifications.map((n) => {
                                    const isExpanded = expandedIds.has(n.id);
                                    const isLong = (n.message || '').length > 110;

                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => openNotificationDetail(n)}
                                            className={`p-4 flex gap-3 group transition-colors cursor-pointer active:bg-neutral/70 ${
                                                !n.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-neutral/50'
                                            }`}
                                        >
                                            {/* Type Icon */}
                                            <div className="mt-0.5 shrink-0">
                                                <div
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                                        !n.is_read ? 'bg-white shadow-sm ring-1 ring-primary/20' : 'bg-neutral'
                                                    }`}
                                                >
                                                    {getTypeIcon(n.type)}
                                                </div>
                                            </div>

                                            {/* Main Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50 block">
                                                            {getTypeLabel(n.type)}
                                                        </span>
                                                        <p
                                                            className={`text-sm leading-tight mt-0.5 ${
                                                                !n.is_read
                                                                    ? 'font-bold text-foreground'
                                                                    : 'font-semibold text-text-secondary'
                                                            }`}
                                                        >
                                                            {n.title}
                                                        </p>
                                                    </div>

                                                    {/* Quick Actions (visible on mobile touch and desktop hover) */}
                                                    <div
                                                        className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {!n.is_read && (
                                                            <button
                                                                type="button"
                                                                onClick={() => markAsRead(n.id)}
                                                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                                                title="Mark as read"
                                                                aria-label="Mark as read"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteNotification(n.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                                            title="Delete"
                                                            aria-label="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Message with inline expand option */}
                                                <p
                                                    className={`text-xs text-text-secondary/80 mt-1.5 leading-relaxed ${
                                                        !isExpanded ? 'line-clamp-2' : ''
                                                    }`}
                                                >
                                                    {n.message}
                                                </p>

                                                {/* Footer metadata & buttons */}
                                                <div className="flex items-center justify-between mt-2.5 pt-1">
                                                    <span className="text-[10px] font-medium text-text-secondary/50 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatNotificationDate(n.created_at)}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        {isLong && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => toggleExpand(n.id, e)}
                                                                className="text-[10px] font-bold text-text-secondary hover:text-foreground flex items-center gap-0.5"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        Less <ChevronUp className="w-3 h-3" />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        More <ChevronDown className="w-3 h-3" />
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openNotificationDetail(n);
                                                            }}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            Open &rarr;
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-20 text-center px-6">
                                    <div className="w-12 h-12 rounded-full bg-neutral flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-6 h-6 text-text-secondary/20" />
                                    </div>
                                    <p className="text-sm font-bold text-text-secondary/40 uppercase tracking-[0.2em]">
                                        No notifications yet
                                    </p>
                                    <p className="text-xs text-text-secondary/30 mt-1">
                                        We&apos;ll notify you here when new updates or RSVPs arrive.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Dropdown footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 bg-neutral/20 border-t border-border flex items-center justify-between text-center shrink-0">
                                <span className="text-[11px] text-text-secondary/60">
                                    Tap any update to view in full
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:text-foreground transition-colors px-2 py-1"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FULL NOTIFICATION DETAIL MODAL (Perfect for Phones & Desktop) */}
            <AnimatePresence>
                {selectedNotification && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNotification(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Dialog Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            role="dialog"
                            aria-modal="true"
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] z-10"
                        >
                            {/* Modal Header */}
                            <div className="p-5 sm:p-6 border-b border-border bg-neutral/20 flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm ring-1 ring-border flex items-center justify-center shrink-0">
                                        {getTypeIcon(selectedNotification.type)}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                                            {getTypeLabel(selectedNotification.type)}
                                        </span>
                                        <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground mt-0.5 leading-snug">
                                            {selectedNotification.title}
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedNotification(null)}
                                    className="p-2 rounded-xl text-text-secondary/60 hover:text-foreground hover:bg-neutral transition-colors shrink-0"
                                    aria-label="Close dialog"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body with Full Content */}
                            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                                <div className="flex items-center gap-2 text-xs text-text-secondary/60 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Received {formatNotificationDate(selectedNotification.created_at)}</span>
                                </div>

                                <div className="rounded-2xl border border-border/80 bg-neutral/30 p-4 sm:p-5">
                                    <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap">
                                        {selectedNotification.message}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="p-4 sm:p-6 border-t border-border bg-neutral/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => deleteNotification(selectedNotification.id)}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    {selectedNotification.link && (
                                        <Link
                                            href={selectedNotification.link}
                                            onClick={() => {
                                                setSelectedNotification(null);
                                                setIsOpen(false);
                                            }}
                                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                                        >
                                            <span>Open Feature</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setSelectedNotification(null)}
                                        className="px-4 py-2.5 rounded-xl border border-border bg-white text-text-secondary hover:text-foreground text-xs sm:text-sm font-bold transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes ring {
                    0% {
                        transform: rotate(0);
                    }
                    1% {
                        transform: rotate(30deg);
                    }
                    3% {
                        transform: rotate(-28deg);
                    }
                    5% {
                        transform: rotate(34deg);
                    }
                    7% {
                        transform: rotate(-32deg);
                    }
                    9% {
                        transform: rotate(30deg);
                    }
                    11% {
                        transform: rotate(-28deg);
                    }
                    13% {
                        transform: rotate(26deg);
                    }
                    15% {
                        transform: rotate(-24deg);
                    }
                    17% {
                        transform: rotate(22deg);
                    }
                    19% {
                        transform: rotate(-20deg);
                    }
                    21% {
                        transform: rotate(18deg);
                    }
                    23% {
                        transform: rotate(-16deg);
                    }
                    25% {
                        transform: rotate(14deg);
                    }
                    27% {
                        transform: rotate(-12deg);
                    }
                    29% {
                        transform: rotate(10deg);
                    }
                    31% {
                        transform: rotate(-8deg);
                    }
                    33% {
                        transform: rotate(6deg);
                    }
                    35% {
                        transform: rotate(-4deg);
                    }
                    37% {
                        transform: rotate(2deg);
                    }
                    39% {
                        transform: rotate(-1deg);
                    }
                    41% {
                        transform: rotate(1deg);
                    }
                    43% {
                        transform: rotate(0);
                    }
                    100% {
                        transform: rotate(0);
                    }
                }
                .animate-ring {
                    animation: ring 2s ease infinite;
                    transform-origin: 50% 0;
                }
            `}</style>
        </div>
    );
}

