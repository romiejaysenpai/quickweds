'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, ExternalLink, Info, MessageSquare, Users, Sparkles, X } from 'lucide-react';
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

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Real-time subscription
        const channel = supabase
            .channel('user_notifications')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'user_notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('user_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (!error && data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('user_notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('user_notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from('user_notifications')
            .delete()
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'rsvp': return <Users className="w-4 h-4 text-emerald-500" />;
            case 'team': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'system': return <Sparkles className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl border border-border bg-white hover:bg-neutral transition-all group"
                aria-label="Notifications"
            >
                <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-red-500 animate-ring' : 'text-text-secondary/60'}`} />
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

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 top-[80px] sm:top-full sm:mt-3 sm:w-96 max-w-[450px] bg-white rounded-2xl shadow-2xl border border-border z-[200] overflow-hidden mx-auto sm:mx-0"
                    >
                        <div className="p-4 border-b border-border bg-neutral/30 flex items-center justify-between">
                            <h3 className="font-serif font-bold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n.id} 
                                            className={`p-4 flex gap-3 group transition-colors ${!n.is_read ? 'bg-primary/5' : 'hover:bg-neutral/50'}`}
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!n.is_read ? 'bg-white shadow-sm' : 'bg-neutral'}`}>
                                                    {getTypeIcon(n.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className={`text-sm leading-tight ${!n.is_read ? 'font-bold text-foreground' : 'font-medium text-text-secondary'}`}>
                                                        {n.title}
                                                    </p>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!n.is_read && (
                                                            <button onClick={() => markAsRead(n.id)} className="p-1 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors" title="Mark as read">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteNotification(n.id)} className="p-1 rounded-md hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-text-secondary/70 mt-1 line-clamp-2">{n.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[9px] font-bold text-text-secondary/30 uppercase tracking-widest">
                                                        {new Date(n.created_at).toLocaleDateString() === new Date().toLocaleDateString() 
                                                            ? 'Today' 
                                                            : new Date(n.created_at).toLocaleDateString()}
                                                    </span>
                                                    {n.link && (
                                                        <Link 
                                                            href={n.link} 
                                                            onClick={() => { markAsRead(n.id); setIsOpen(false); }}
                                                            className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                                                        >
                                                            View <ExternalLink className="w-2 h-2" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center px-6">
                                    <div className="w-12 h-12 rounded-full bg-neutral flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-6 h-6 text-text-secondary/20" />
                                    </div>
                                    <p className="text-sm font-bold text-text-secondary/30 uppercase tracking-[0.2em]">No notifications yet</p>
                                    <p className="text-xs text-text-secondary/20 mt-1 italic">We'll let you know when things happen.</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-neutral/10 border-t border-border text-center">
                                <button onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/50 hover:text-foreground transition-colors">
                                    Close Panel
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes ring {
                    0% { transform: rotate(0); }
                    1% { transform: rotate(30deg); }
                    3% { transform: rotate(-28deg); }
                    5% { transform: rotate(34deg); }
                    7% { transform: rotate(-32deg); }
                    9% { transform: rotate(30deg); }
                    11% { transform: rotate(-28deg); }
                    13% { transform: rotate(26deg); }
                    15% { transform: rotate(-24deg); }
                    17% { transform: rotate(22deg); }
                    19% { transform: rotate(-20deg); }
                    21% { transform: rotate(18deg); }
                    23% { transform: rotate(-16deg); }
                    25% { transform: rotate(14deg); }
                    27% { transform: rotate(-12deg); }
                    29% { transform: rotate(10deg); }
                    31% { transform: rotate(-8deg); }
                    33% { transform: rotate(6deg); }
                    35% { transform: rotate(-4deg); }
                    37% { transform: rotate(2deg); }
                    39% { transform: rotate(-1deg); }
                    41% { transform: rotate(1deg); }
                    43% { transform: rotate(0); }
                    100% { transform: rotate(0); }
                }
                .animate-ring {
                    animation: ring 2s ease infinite;
                    transform-origin: 50% 0;
                }
            `}</style>
        </div>
    );
}
