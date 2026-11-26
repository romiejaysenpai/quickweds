'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Music, Users, AlertCircle, CalendarDays, Search, UserCheck, X, Check } from 'lucide-react';
import type { RsvpEventResponse, WeddingRsvpEvent } from '@/types/wedding';
import { trackWeddingEvent } from '@/lib/wedding-features';
import { getTemplateVisualProfile } from '@/lib/theme-engine';

const DIETARY_OPTIONS = [
    'No Preference',
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher',
    'Gluten-Free',
    'Other (see message)',
];

type SearchedGuest = {
    id: string;
    guestName: string;
    householdName?: string | null;
    householdMembers?: string[];
    attendance?: string | null;
    rsvpStatus?: string;
    numGuests?: number;
    plusOneAllowed?: boolean;
    plusOneName?: string;
    childrenCount?: number;
    mealPreference?: string;
    hasEmail?: boolean;
    maskedEmail?: string;
    tableAssignment?: string | null;
    verificationAvailable?: boolean;
    guestEmail?: string;
    invitedGuestCount?: number;
    dietaryDetails?: string;
    message?: string;
    songRequest?: string;
    eventResponses?: RsvpEventResponse[];
};

type WeddingPreview = {
    template?: string;
    template_style?: string;
    motif_color?: string;
    background_style?: string;
    rsvp_events?: WeddingRsvpEvent[] | string;
    rsvp_allow_plus_ones?: boolean;
    rsvp_allow_children?: boolean;
    rsvp_search_guest_list?: boolean;
};

const LIGHT_BACKGROUND_STYLES = new Set(['white', 'cream', 'satin', 'paper', 'minimal', 'rose', 'linen']);

export default function RSVPForm({ weddingId, wedding, verifiedGuest, accessToken }: { weddingId: string; wedding?: WeddingPreview; verifiedGuest?: SearchedGuest; accessToken?: string }) {
    const events = (() => {
        if (Array.isArray(wedding?.rsvp_events)) return wedding.rsvp_events.filter((event) => event?.id && event?.name);
        if (typeof wedding?.rsvp_events !== 'string') return [];
        try {
            const value = JSON.parse(wedding.rsvp_events);
            return Array.isArray(value) ? value.filter((event) => event?.id && event?.name) : [];
        } catch {
            return [];
        }
    })() as WeddingRsvpEvent[];

    const visual = getTemplateVisualProfile(wedding?.template, wedding?.motif_color);
    const hasLightOverride = Boolean(
        wedding?.template_style === 'luxury-planner' ||
        wedding?.template === 'luxury-planner' ||
        (wedding?.background_style && LIGHT_BACKGROUND_STYLES.has(wedding.background_style))
    );
    const isDark = visual.isDark && !hasLightOverride;
    const { isSharp, isVintage } = visual;

    const fieldClass = `w-full min-h-[48px] border px-4 py-3 text-base outline-none transition-colors placeholder:text-text-secondary/65 focus:border-primary sm:px-5 sm:py-3.5 ${
        isDark ? 'rounded-xl border-white/15 bg-white/[0.06] text-white placeholder:text-white/55' :
        isSharp ? 'rounded-none border-x-0 border-t-0 border-b border-black/25 bg-transparent px-1 sm:px-1 text-foreground focus:border-black' :
        isVintage ? 'rounded-sm border-[#d4c5b3] bg-white/75 text-foreground' :
        'rounded-xl border-border/80 bg-white/75 text-foreground'
    }`;
    const optionClass = isDark ? 'bg-[#17171a] text-white' : 'bg-white text-foreground';
    const labelClass = `block text-[11px] font-medium uppercase tracking-[0.22em] ${isDark ? 'text-white/70' : 'text-text-secondary'}`;

    const [overrideVerified, setOverrideVerified] = useState(false);
    const activeVerifiedGuest = overrideVerified ? undefined : verifiedGuest;
    const activeAccessToken = overrideVerified ? undefined : accessToken;

    useEffect(() => {
        setOverrideVerified(false);
    }, [verifiedGuest?.id]);

    const allowPlusOnes = wedding?.rsvp_allow_plus_ones !== false && (!activeVerifiedGuest || activeVerifiedGuest.plusOneAllowed === true);
    const allowChildren = wedding?.rsvp_allow_children !== false;
    const enableSearch = !activeVerifiedGuest && wedding?.rsvp_search_guest_list !== false;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [duplicateError, setDuplicateError] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Guest search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchedGuest[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<SearchedGuest | null>(verifiedGuest || null);
    const searchRef = useRef<HTMLDivElement>(null);
    const confettiRafRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (confettiRafRef.current !== null) {
                cancelAnimationFrame(confettiRafRef.current);
                confettiRafRef.current = null;
            }
        };
    }, []);

    const [formData, setFormData] = useState({
        guestName: verifiedGuest?.guestName || '',
        guestEmail: verifiedGuest?.guestEmail || '',
        attendance: verifiedGuest?.attendance === 'No' ? 'No' : 'Yes',
        numGuests: Math.max(1, verifiedGuest?.numGuests || 1),
        mealPreference: verifiedGuest?.mealPreference || '',
        dietaryDetails: verifiedGuest?.dietaryDetails || '',
        message: verifiedGuest?.message || '',
        plusOneNames: verifiedGuest?.plusOneName || '',
        songRequest: verifiedGuest?.songRequest || '',
        childrenCount: verifiedGuest?.childrenCount || 0,
        householdName: verifiedGuest?.householdName || '',
        householdMembers: verifiedGuest?.householdMembers?.join('\n') || '',
        eventResponses: (verifiedGuest?.eventResponses?.filter((resp) =>
            events.some((event) => event.id === resp.eventId)
        ) || events.map((event) => ({ eventId: event.id, attendance: 'Yes' as const }))) as RsvpEventResponse[],
    });

    const [accessMessage, setAccessMessage] = useState('');
    const [isRequestingAccess, setIsRequestingAccess] = useState(false);
    const [manageUrl, setManageUrl] = useState('');
    const isAttending = formData.attendance !== 'No';

    // Debounced guest list search with request cancellation
    useEffect(() => {
        if (!enableSearch) return;
        const query = searchQuery.trim();
        if (query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `/api/public/rsvp/search?weddingId=${encodeURIComponent(weddingId)}&q=${encodeURIComponent(query)}`,
                    { signal: controller.signal }
                );
                if (res.ok && !controller.signal.aborted) {
                    const data = await res.json();
                    setSearchResults(data.guests || []);
                    setIsDropdownOpen(true);
                }
            } catch (err) {
                if ((err as Error)?.name !== 'AbortError') {
                    console.warn('Guest search failed:', err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsSearching(false);
                }
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery, weddingId, enableSearch]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectGuest = async (guest: SearchedGuest) => {
        setSelectedGuest(guest);
        setIsDropdownOpen(false);
        setIsRequestingAccess(true);
        setAccessMessage('');
        try {
            const response = await fetch('/api/public/rsvp/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weddingId, rsvpId: guest.id }) });
            const result = await response.json();
            setAccessMessage(response.ok ? result.message : result.error || 'Unable to request a secure link. Please try again.');
        } catch { setAccessMessage('Unable to request a secure link. Please try again.'); }
        finally { setIsRequestingAccess(false); }
    };

    const handleClearSelectedGuest = () => {
        if (verifiedGuest) {
            setOverrideVerified(true);
        }
        setSelectedGuest(null);
        setAccessMessage('');
        setSearchQuery('');
        setFormData((prev) => ({
            ...prev,
            guestName: '',
            guestEmail: '',
            attendance: 'Yes',
            numGuests: 1,
            plusOneNames: '',
            childrenCount: 0,
            householdName: '',
            householdMembers: '',
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setDuplicateError(false);
        setSubmitError(null);

        const safeNumGuests = Math.max(
            1,
            Number.isFinite(formData.numGuests) && formData.numGuests >= 1 ? Math.floor(formData.numGuests) : 1
        );
        const safeChildrenCount = Math.max(
            0,
            Number.isFinite(formData.childrenCount) && formData.childrenCount >= 0 ? Math.floor(formData.childrenCount) : 0
        );

        try {
            const response = await fetch('/api/public/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId,
                    rsvpId: activeVerifiedGuest?.id,
                    accessToken: activeAccessToken,
                    guestName: formData.guestName.trim(),
                    guestEmail: formData.guestEmail.trim(),
                    attendance: formData.attendance,
                    numGuests: isAttending ? (allowPlusOnes ? safeNumGuests : 1) : 1,
                    mealPreference: formData.mealPreference,
                    dietaryDetails: formData.dietaryDetails,
                    message: formData.message,
                    plusOneNames: isAttending && allowPlusOnes && safeNumGuests > 1 ? formData.plusOneNames : '',
                    songRequest: formData.songRequest,
                    childrenCount: isAttending && allowChildren ? safeChildrenCount : 0,
                    householdName: formData.householdName.trim(),
                    householdMembers: isAttending && allowPlusOnes && safeNumGuests > 1
                        ? formData.householdMembers.split(/\n|,/).map((name) => name.trim()).filter(Boolean)
                        : [],
                    eventResponses: formData.eventResponses.filter((resp) =>
                        events.some((event) => event.id === resp.eventId)
                    ),
                }),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 409 || result.code === 'duplicate_rsvp') {
                    setDuplicateError(true);
                }
                setSubmitError(result.error || 'Submission failed. Please try again.');
                setIsSubmitting(false);
                return;
            }

            setManageUrl(result.manageRsvpUrl || '');
            setIsSubmitted(true);

            // Celebrate attending responses with lazily loaded confetti
            if (isAttending && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                void import('canvas-confetti')
                    .then(({ default: confetti }) => {
                        const end = Date.now() + 2600;
                        const colors = [wedding?.motif_color || '#D4AF37', '#ffffff', '#ffd700'];
                        const frame = () => {
                            confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
                            confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
                            if (Date.now() < end) {
                                confettiRafRef.current = requestAnimationFrame(frame);
                            } else {
                                confettiRafRef.current = null;
                            }
                        };
                        confettiRafRef.current = requestAnimationFrame(frame);
                    })
                    .catch(() => {});
            }

            void trackWeddingEvent(weddingId, 'rsvp_submitted', {
                source: 'rsvp_form',
                attendance: formData.attendance,
            });
        } catch (err) {
            console.error(err);
            setSubmitError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <motion.div data-wedding-card="true" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 sm:p-10 border text-center ${visual.cardClass}`}>
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center">
                    <CheckCircle2 data-wedding-status="success" className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-serif mb-2 text-foreground">Thank You!</h3>
                <p className="text-text-secondary italic">Your response has been received. Thank you for letting us know!</p>
                {manageUrl && <a data-wedding-control="secondary" href={manageUrl} className="mt-5 inline-block underline">Update your response (link expires in 30 minutes)</a>}
            </motion.div>
        );
    }

    if (selectedGuest && !activeVerifiedGuest) return (
        <div data-wedding-card="true" className={`space-y-4 p-6 ${visual.cardClass}`} role="status">
            <h3 className="text-xl font-bold">Verify your invitation</h3>
            <p>{isRequestingAccess ? 'Requesting your secure link…' : accessMessage}</p>
            <p>If you cannot access the email on your invitation, contact the couple to update it.</p>
            <button data-wedding-control="quiet" type="button" onClick={handleClearSelectedGuest} className="underline">Back to guest search</button>
        </div>
    );

    return (
        <div className={`mx-auto w-full max-w-2xl p-0 sm:p-2 transition-colors ${
            isDark ? 'text-white' :
            isSharp ? 'text-[#352C2C]' :
            isVintage ? 'text-[#352C2C]' :
            'text-[#352C2C]'
        }`}>
            <h3 className="sr-only">RSVP for our Special Day</h3>

            {duplicateError && (
                <div data-wedding-status="error" className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">You have already submitted an RSVP for this name. Please select your name from the search to update your response.</p>
                </div>
            )}

            {submitError && (
                <div data-wedding-status="error" className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-red-600 text-sm">Submission Error</p>
                        <p className="text-xs text-red-600/70">{submitError}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left sm:space-y-6">
                {/* Searchable guest list / Selected Guest Header */}
                {activeVerifiedGuest ? (
                    <div data-wedding-card="true" className={`flex items-center justify-between rounded-2xl border p-4 shadow-xs ${isDark ? 'border-primary/30 bg-primary/10' : 'border-primary/20 bg-primary/5'}`}>
                        <div className="flex items-center gap-3">
                            <div data-wedding-overlay="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-primary">Found on Guest List</p>
                                <p className="font-serif text-lg font-bold">{activeVerifiedGuest.guestName}</p>
                                {activeVerifiedGuest.householdName && (
                                    <p className={`text-xs ${isDark ? 'text-white/60' : 'text-text-secondary'}`}>Household: {activeVerifiedGuest.householdName}</p>
                                )}
                            </div>
                        </div>
                        <button data-wedding-control="quiet"
                            type="button"
                            onClick={handleClearSelectedGuest}
                            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                                isDark ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white' : 'border-border bg-white hover:bg-neutral text-text-secondary'
                            }`}
                        >
                            <X className="h-3.5 w-3.5" /> Change
                        </button>
                    </div>
                ) : enableSearch ? (
                    <div ref={searchRef} className="relative space-y-2">
                        <label className={`${labelClass} flex items-center gap-1.5`}>
                            <Search className="h-3.5 w-3.5 text-primary" /> Search Guest List or Enter Name *
                        </label>
                        <div className="relative">
                            <input data-wedding-field="true"
                                required
                                placeholder="Type your name to find your invitation..."
                                value={formData.guestName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => ({ ...prev, guestName: val }));
                                    setSearchQuery(val);
                                    if (val.trim().length >= 2) setIsDropdownOpen(true);
                                }}
                                onFocus={() => {
                                    if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
                                        setIsDropdownOpen(true);
                                    }
                                }}
                                className={fieldClass}
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            )}
                        </div>

                        {/* Search dropdown results */}
                        <AnimatePresence>
                            {isDropdownOpen && (
                                searchResults.length > 0 ? (
                                    <motion.div data-wedding-card="true"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className={`absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl border p-2 shadow-2xl backdrop-blur-xl ${
                                            isDark ? 'border-white/15 bg-neutral-900/95 text-white' : 'border-border bg-white/95 text-foreground'
                                        }`}
                                    >
                                        <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary">
                                            Select your name from the guest list
                                        </p>
                                        <div className="divide-y divide-border/40">
                                            {searchResults.map((guest) => (
                                                <button data-wedding-control="quiet"
                                                    key={guest.id}
                                                    type="button"
                                                    onClick={() => handleSelectGuest(guest)}
                                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                                                        isDark ? 'hover:bg-white/10' : 'hover:bg-primary/5'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="font-semibold">{guest.guestName}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                                            {guest.householdName && (
                                                                <span className="text-xs text-text-secondary flex items-center gap-1">
                                                                    <Users className="h-3 w-3" /> {guest.householdName}
                                                                </span>
                                                            )}
                                                            {guest.plusOneAllowed && (
                                                                <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">
                                                                    +1 Allowed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span data-wedding-status="true" className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                            guest.rsvpStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                                            guest.rsvpStatus === 'declined' ? 'bg-red-100 text-red-800' :
                                                            'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {guest.rsvpStatus || 'Invited'}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-border/50 pt-2 px-2">
                                            <button data-wedding-control="quiet"
                                                type="button"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className={`w-full rounded-xl py-1.5 text-center text-xs font-semibold text-text-secondary hover:text-foreground`}
                                            >
                                                Not listed above? Continue with &quot;{formData.guestName}&quot;
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : !isSearching && searchQuery.trim().length >= 2 ? (
                                    <motion.div data-wedding-card="true"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className={`absolute left-0 right-0 z-50 mt-1 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl ${
                                            isDark ? 'border-white/15 bg-neutral-900/95 text-white' : 'border-border bg-white/95 text-foreground'
                                        }`}
                                    >
                                        <p className="text-xs text-text-secondary">
                                            Not on the pre-loaded guest list? You can still submit your RSVP with &quot;<span className="font-semibold text-foreground">{formData.guestName}</span>&quot;!
                                        </p>
                                    </motion.div>
                                ) : null
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className={labelClass}>Guest Full Name *</label>
                        <input data-wedding-field="true"
                            required
                            placeholder="Enter your full name"
                            value={formData.guestName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, guestName: e.target.value }))}
                            className={fieldClass}
                        />
                    </div>
                )}

                {/* Email Address */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>Email Address (optional)</label>
                        {selectedGuest?.hasEmail && (
                            <span className="text-xs text-text-secondary">
                                Masked on file: {selectedGuest.maskedEmail}
                            </span>
                        )}
                    </div>
                    <input data-wedding-field="true"
                        readOnly={Boolean(activeVerifiedGuest)}
                        type="email"
                        placeholder="For your RSVP confirmation"
                        value={formData.guestEmail}
                        onChange={(e) => setFormData((prev) => ({ ...prev, guestEmail: e.target.value }))}
                        className={fieldClass}
                    />
                </div>

                {/* Attendance & Guest Count */}
                <div className="space-y-4">
                    <div className="space-y-2.5">
                        <span className={labelClass}>Will you be attending?</span>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Will you be attending?">
                            {[
                                { value: 'Yes', title: 'Joyfully Accepts', subtitle: 'Count me in for the celebration' },
                                { value: 'No', title: 'Regretfully Declines', subtitle: 'Celebrating with you from afar' },
                            ].map((option) => {
                                const selected = formData.attendance === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        data-wedding-control="quiet"
                                        aria-pressed={selected}
                                        onClick={() => {
                                            const nextAttendance = option.value;
                                            setFormData((prev) => ({
                                                ...prev,
                                                attendance: nextAttendance,
                                                ...(nextAttendance === 'No'
                                                    ? {
                                                          childrenCount: 0,
                                                          plusOneNames: '',
                                                          householdMembers: '',
                                                          mealPreference: '',
                                                          dietaryDetails: '',
                                                          songRequest: '',
                                                          eventResponses: prev.eventResponses.map((item) => ({ ...item, attendance: 'No' as const })),
                                                      }
                                                    : {
                                                          eventResponses: prev.eventResponses.every((item) => item.attendance === 'No')
                                                              ? prev.eventResponses.map((item) => ({ ...item, attendance: 'Yes' as const }))
                                                              : prev.eventResponses,
                                                      }),
                                            }));
                                        }}
                                        className={`flex min-h-[72px] items-center justify-between gap-3 border px-5 py-4 text-left transition-all ${
                                            isSharp ? 'rounded-none' : 'rounded-xl'
                                        } ${
                                            selected
                                                ? isDark
                                                    ? 'border-primary bg-primary/15 text-white'
                                                    : 'border-primary bg-primary/[0.07] text-foreground'
                                                : isDark
                                                  ? 'border-white/15 bg-white/[0.03] text-white/75 hover:border-white/30'
                                                  : 'border-black/15 bg-white/60 text-foreground/75 hover:border-black/30'
                                        }`}
                                    >
                                        <div>
                                            <span className="block font-serif text-lg leading-snug">{option.title}</span>
                                            <span className="mt-0.5 block text-xs opacity-70">{option.subtitle}</span>
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                                selected
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-current/30'
                                            }`}
                                        >
                                            {selected && <Check className="h-3.5 w-3.5" />}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {isAttending && allowPlusOnes && (
                        <div className="space-y-2">
                            <label className={labelClass}>Number of Guests</label>
                            <input data-wedding-field="true"
                                type="number"
                                min="1"
                                max={activeVerifiedGuest?.invitedGuestCount || 50}
                                inputMode="numeric"
                                placeholder="1"
                                value={formData.numGuests === 0 ? '' : formData.numGuests}
                                onChange={(e) => {
                                    const parsed = parseInt(e.target.value, 10);
                                    setFormData((prev) => ({ ...prev, numGuests: e.target.value === '' || Number.isNaN(parsed) ? 0 : Math.max(1, parsed) }));
                                }}
                                onBlur={() => {
                                    setFormData((prev) => ({ ...prev, numGuests: prev.numGuests < 1 ? 1 : prev.numGuests }));
                                }}
                                className={`${fieldClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            />
                        </div>
                    )}
                </div>

                {/* Additional Guests Names (+1) */}
                {isAttending && allowPlusOnes && formData.numGuests > 1 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                        <label className={`${labelClass} flex items-center gap-2`}>
                            <Users className="w-4 h-4 text-primary" /> Names of Additional Guests (+1 Party)
                        </label>
                        <input data-wedding-field="true"
                            placeholder="Additional guests, excluding yourself (e.g. Jane Doe)"
                            value={formData.plusOneNames}
                            onChange={(e) => setFormData((prev) => ({ ...prev, plusOneNames: e.target.value }))}
                            className={fieldClass}
                        />
                        <p className={`ml-1 text-xs ${isDark ? 'text-white/50' : 'text-text-secondary'}`}>
                            Providing names allows the couple to prepare personalized seating for your guests.
                        </p>
                    </motion.div>
                )}

                {/* Family / Household Name & Members */}
                <div className="space-y-2">
                    <label className={`${labelClass} flex items-center gap-2`}>
                        <Users className="h-4 w-4 text-primary" /> Household or Family Name
                    </label>
                    <input data-wedding-field="true"
                        placeholder="e.g. The Santos Family"
                        value={formData.householdName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, householdName: e.target.value }))}
                        className={fieldClass}
                    />
                    <p className={`ml-1 text-xs ${isDark ? 'text-white/50' : 'text-text-secondary'}`}>
                        Optional. Add a label for the guests included in your invitation.
                    </p>
                </div>

                {isAttending && allowPlusOnes && formData.numGuests > 1 && (
                    <div className="space-y-2">
                        <label className={labelClass}>Household / Party Member Names</label>
                        <textarea data-wedding-field="true"
                            placeholder={'One name per line (additional guests, excluding yourself)\nJamie Santos\nAvery Santos'}
                            value={formData.householdMembers}
                            onChange={(e) => setFormData((prev) => ({ ...prev, householdMembers: e.target.value }))}
                            className={`${fieldClass} min-h-24 resize-y`}
                        />
                        <p className={`ml-1 text-xs ${isDark ? 'text-white/50' : 'text-text-secondary'}`}>
                            These names describe the other guests in your party. Separate invitations must be confirmed with their own secure links.
                        </p>
                    </div>
                )}

                {/* Event Responses */}
                {isAttending && events.length > 0 && (
                    <fieldset data-wedding-card="true" className={`space-y-3 rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-neutral/50'}`}>
                        <legend className={`px-2 text-sm font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>Choose events</legend>
                        {events.map((event) => {
                            const response = formData.eventResponses.find((item) => item.eventId === event.id)?.attendance || 'Yes';
                            return (
                                <div key={event.id} className={`grid gap-3 border-b pb-4 last:border-0 last:pb-0 sm:grid-cols-[1fr_150px] ${isDark ? 'border-white/10' : 'border-border'}`}>
                                    <div>
                                        <p className={`flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
                                            <CalendarDays className="h-4 w-4 text-primary" /> {event.name}
                                        </p>
                                        <p className={`mt-1 text-xs ${isDark ? 'text-white/55' : 'text-text-secondary'}`}>
                                            {[event.date, event.time, event.venue].filter(Boolean).join(' · ')}
                                        </p>
                                        {event.description && <p className={`mt-1 text-xs ${isDark ? 'text-white/55' : 'text-text-secondary'}`}>{event.description}</p>}
                                    </div>
                                    <select data-wedding-field="true"
                                        aria-label={`Attendance for ${event.name}`}
                                        value={response}
                                        onChange={(e) => setFormData((prev) => ({
                                            ...prev,
                                            eventResponses: prev.eventResponses.some((item) => item.eventId === event.id)
                                                ? prev.eventResponses.map((item) => item.eventId === event.id ? { ...item, attendance: e.target.value as RsvpEventResponse['attendance'] } : item)
                                                : [...prev.eventResponses, { eventId: event.id, attendance: e.target.value as RsvpEventResponse['attendance'] }],
                                        }))}
                                        className={fieldClass}
                                    >
                                        <option className={optionClass} value="Yes">Attending</option>
                                        <option className={optionClass} value="Maybe">Maybe</option>
                                        <option className={optionClass} value="No">Not attending</option>
                                    </select>
                                </div>
                            );
                        })}
                    </fieldset>
                )}

                {/* Children Count & Dietary Preferences */}
                {isAttending && (
                    <div className={`grid grid-cols-1 ${allowChildren ? 'md:grid-cols-2' : ''} gap-4`}>
                        {allowChildren && (
                            <div className="space-y-2">
                                <label className={labelClass}>Children Attending</label>
                                <input data-wedding-field="true"
                                    type="number"
                                    min="0"
                                    max="100"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={formData.childrenCount === 0 ? '' : formData.childrenCount}
                                    onChange={(e) => {
                                        const parsed = parseInt(e.target.value, 10);
                                        setFormData((prev) => ({ ...prev, childrenCount: e.target.value === '' || Number.isNaN(parsed) ? 0 : Math.max(0, parsed) }));
                                    }}
                                    className={`${fieldClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className={labelClass}>Dietary Preference</label>
                            <select data-wedding-field="true"
                                value={formData.mealPreference}
                                onChange={(e) => setFormData((prev) => ({ ...prev, mealPreference: e.target.value }))}
                                className={fieldClass}
                            >
                                <option className={optionClass} value="">Select...</option>
                                {DIETARY_OPTIONS.map((opt) => (
                                    <option className={optionClass} key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {formData.mealPreference === 'Other (see message)' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                        <label className={labelClass}>Dietary Details / Allergies</label>
                        <input data-wedding-field="true"
                            placeholder="Please describe your dietary requirements"
                            value={formData.dietaryDetails}
                            onChange={(e) => setFormData((prev) => ({ ...prev, dietaryDetails: e.target.value }))}
                            className={fieldClass}
                        />
                    </motion.div>
                )}

                {/* Song Request */}
                {isAttending && (
                    <div className="space-y-2">
                        <label className={`${labelClass} flex items-center gap-2`}>
                            <Music className="w-3.5 h-3.5 text-primary" /> Song Request
                        </label>
                        <input data-wedding-field="true"
                            placeholder="e.g. 'Dancing Queen' by ABBA"
                            value={formData.songRequest}
                            onChange={(e) => setFormData((prev) => ({ ...prev, songRequest: e.target.value }))}
                            className={fieldClass}
                        />
                    </div>
                )}

                {/* Message for the Couple */}
                <div className="space-y-2">
                    <label className={labelClass}>Message for the Couple</label>
                    <textarea data-wedding-field="true"
                        placeholder="Write a note for the couple..."
                        value={formData.message}
                        onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                        className={`${fieldClass} min-h-32 resize-y`}
                    />
                </div>

                <button data-wedding-control="primary"
                    disabled={isSubmitting}
                    className={`w-full py-4 min-h-[54px] bg-primary text-white text-xs font-semibold uppercase tracking-[0.26em] hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer ${
                        isSharp ? 'rounded-none' : 'rounded-full'
                    }`}
                >
                    {isSubmitting ? (
                        'Sending...'
                    ) : (
                        <>
                            Submit RSVP
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
