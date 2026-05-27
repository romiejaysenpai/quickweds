'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarCheck, PlayCircle, Video, X } from 'lucide-react';

export default function DemoSection({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-md sm:px-6 sm:py-10"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-2xl shadow-black/25 sm:rounded-[2rem]"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition hover:bg-primary hover:text-white sm:h-12 sm:w-12"
                            aria-label="Close demo"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>

                        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="relative min-h-[320px] bg-[linear-gradient(135deg,#3A2A2D_0%,#7A5A61_55%,#D16C78_100%)] p-5 text-white sm:min-h-[420px] sm:p-8">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(214,184,124,0.3),transparent_28%)]" />
                                <div className="relative flex h-full min-h-[280px] items-center justify-center rounded-[1.25rem] border border-white/20 bg-white/10 p-5 backdrop-blur-sm sm:min-h-[360px] sm:rounded-[1.7rem]">
                                    <div className="text-center">
                                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-primary shadow-2xl shadow-black/20 sm:h-24 sm:w-24">
                                            <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12" />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/70">Video demo</p>
                                        <h3 className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-5xl">Coming soon</h3>
                                        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/75 sm:text-base">
                                            A guided walkthrough will live here so couples can see QuickWeds in action before creating a site.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 text-center sm:p-8 lg:p-10 lg:text-left">
                                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.28em]">
                                    <Video className="h-3.5 w-3.5" />
                                    Demo
                                </span>
                                <h2 className="font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                                    See how QuickWeds simplifies the whole wedding.
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-text-secondary sm:text-base">
                                    The video walkthrough is being prepared. For now, you can start building instantly from your QuickWeds workspace.
                                </p>

                                <div className="mt-6 grid gap-3 text-left">
                                    {[
                                        'Create a wedding website and RSVP flow',
                                        'Track guests, budgets, vendors, tasks, and seating',
                                        'Send automated RSVP emails, notifications, and reminders',
                                    ].map((item) => (
                                        <p key={item} className="flex gap-3 rounded-2xl bg-neutral p-3 text-sm font-semibold leading-6 text-foreground">
                                            <CalendarCheck className="mt-0.5 h-5 w-5 flex-none text-primary" />
                                            {item}
                                        </p>
                                    ))}
                                </div>

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:justify-start">
                                    <Link
                                        href="/builder"
                                        onClick={onClose}
                                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover"
                                    >
                                        Start Free
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                                    >
                                        Back to Landing Page
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
