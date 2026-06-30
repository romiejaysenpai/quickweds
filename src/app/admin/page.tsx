'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Bot, Megaphone, Settings, ShieldCheck, Users } from 'lucide-react';

export default function AdminHubPage() {
    useEffect(() => {
        document.title = 'Admin Hub | QuickWeds';
    }, []);

    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-white p-5 shadow-xl sm:p-8">
                <div className="mb-8 flex items-start justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            Admin Hub
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">QuickWeds Administration</h1>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            Manage platform updates, users, and global settings from the admin control center.
                        </p>
                    </div>
                    <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5">
                        Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <Link href="/admin/broadcast" className="group flex flex-col justify-between rounded-2xl border border-border bg-neutral/20 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md">
                        <div>
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                <Megaphone className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-foreground">System Broadcasts</h2>
                            <p className="mt-2 text-xs leading-5 text-text-secondary">
                                Send in-app notifications and important email updates to all QuickWeds accounts.
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/users" className="group flex flex-col justify-between rounded-2xl border border-border bg-neutral/20 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md">
                        <div>
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                <Users className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-foreground">User Management</h2>
                            <p className="mt-2 text-xs leading-5 text-text-secondary">
                                Manage user accounts, view statistics, and handle platform support requests.
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/support" className="group flex flex-col justify-between rounded-2xl border border-border bg-neutral/20 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md">
                        <div>
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                <Bot className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-foreground">Support Agent</h2>
                            <p className="mt-2 text-xs leading-5 text-text-secondary">
                                Review tickets and generate safe investigation reports, PR drafts, and SQL change requests.
                            </p>
                        </div>
                    </Link>

                    <Link href="/admin/settings" className="group flex flex-col justify-between rounded-2xl border border-border bg-neutral/20 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-md">
                        <div>
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-foreground">Platform Settings</h2>
                            <p className="mt-2 text-xs leading-5 text-text-secondary">
                                Configure global platform features, maintenance modes, and feature flags.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
