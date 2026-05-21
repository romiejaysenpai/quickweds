'use client';

import { Search, Filter, ShieldCheck, Mail, MoreHorizontal, Crown } from 'lucide-react';
import Link from 'next/link';

// Static placeholder data for the premium UI until the backend API is fully wired
const MOCK_USERS = [
    { id: '1', name: 'Sarah & James', email: 'sarah.j@example.com', type: 'couple', isPro: true, date: '2025-08-14' },
    { id: '2', name: 'Michael Chen', email: 'michael@prestigecatering.com', type: 'supplier', isPro: false, date: '2025-06-20' },
    { id: '3', name: 'Emma & Liam', email: 'emma.liam2026@example.com', type: 'couple', isPro: false, date: '2025-09-05' },
    { id: '4', name: 'Rosewood Photography', email: 'hello@rosewood.io', type: 'supplier', isPro: true, date: '2025-07-11' },
];

export default function AdminUsersPage() {
    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-white p-5 shadow-xl sm:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <ShieldCheck className="h-4 w-4" />
                            Admin Console
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">User Management</h1>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            View and manage all registered QuickWeds accounts, couples, and suppliers.
                        </p>
                    </div>
                    <Link href="/admin" className="inline-flex rounded-xl border border-border px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5">
                        Back to Hub
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="w-full rounded-xl border border-border bg-neutral/30 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-white"
                        />
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-neutral/30 px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-neutral/50">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto rounded-2xl border border-border bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral/40 text-xs font-bold uppercase tracking-wider text-text-secondary">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Account Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_USERS.map((user) => (
                                <tr key={user.id} className="transition hover:bg-neutral/10">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{user.name}</p>
                                                <p className="flex items-center gap-1 text-xs text-text-secondary">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${user.type === 'couple' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isPro ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                                <Crown className="h-3.5 w-3.5" /> PRO
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold text-text-secondary">Free</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">
                                        {new Date(user.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="rounded-lg p-2 text-text-secondary hover:bg-neutral hover:text-foreground">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                    <p className="text-xs text-text-secondary">Showing 4 of 420 users (Demo Data)</p>
                    <div className="flex gap-2">
                        <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-neutral">Prev</button>
                        <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-neutral">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
