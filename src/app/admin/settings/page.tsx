'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCheck, Lock, Power, Save, ShieldCheck, Zap } from 'lucide-react';

export default function AdminSettingsPage() {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-white p-5 shadow-xl sm:p-8">
                <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            Admin Console
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">Platform Settings</h1>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            Configure global application behavior and manage feature flags.
                        </p>
                    </div>
                    <Link href="/admin" className="inline-flex rounded-xl border border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5">
                        Back to Hub
                    </Link>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-neutral/20 p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-text/10 text-error-text">
                                <Power className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-foreground">Maintenance Mode</h2>
                                <p className="text-xs text-text-secondary">Disable access to the platform for all non-admin users.</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4">
                            <span className="text-sm font-semibold text-foreground">Enable Maintenance Mode</span>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input type="checkbox" className="peer sr-only" />
                                <div className="peer h-6 w-11 rounded-full bg-border after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                            </label>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-neutral/20 p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-foreground">Feature Flags</h2>
                                <p className="text-xs text-text-secondary">Enable or disable new features platform-wide.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4">
                                <div>
                                    <span className="block text-sm font-semibold text-foreground">Supplier Directory</span>
                                    <span className="text-xs text-text-secondary">Allow couples to discover premium suppliers.</span>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input type="checkbox" defaultChecked className="peer sr-only" />
                                    <div className="peer h-6 w-11 rounded-full bg-border after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                                </label>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4">
                                <div>
                                    <span className="block text-sm font-semibold text-foreground">AI Description Generator</span>
                                    <span className="text-xs text-text-secondary">Enable GPT-powered suggestions for wedding websites.</span>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="peer h-6 w-11 rounded-full bg-border after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-neutral/20 p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-foreground">Security & Access</h2>
                                <p className="text-xs text-text-secondary">Manage platform signups and authentication rules.</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4">
                            <div>
                                <span className="block text-sm font-semibold text-foreground">Allow New Signups</span>
                                <span className="text-xs text-text-secondary">When disabled, new users cannot create accounts.</span>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input type="checkbox" defaultChecked className="peer sr-only" />
                                <div className="peer h-6 w-11 rounded-full bg-border after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white transition-all hover:bg-primary-hover"
                    >
                        {saved ? <CheckCheck className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {saved ? 'Settings Saved' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
