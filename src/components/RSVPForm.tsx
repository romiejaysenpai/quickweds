'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Music, Users, AlertCircle, CalendarDays, Search, UserCheck, X, Sparkles } from 'lucide-react';
import type { RsvpEventResponse, WeddingRsvpEvent } from '@/types/wedding';
import { trackWeddingEvent } from '@/lib/wedding-features';
import confetti from 'canvas-confetti';
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
};

type WeddingPreview = {
    template?: string;
    motif_color?: string;
    rsvp_events?: WeddingRsvpEvent[] | string;
    rsvp_allow_plus_ones?: boolean;
    rsvp_allow_children?: boolean;
    rsvp_search_guest_list?: boolean;
};

export default function RSVPForm({ weddingId, wedding }: { weddingId: string; wedding?: WeddingPreview }) {
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
    const { isSharp, isDark, isVintage } = visual;

    const fieldClass = `w-full min-h-[48px] rounded-2xl border px-4 py-3 text-base outline-none transition-all placeholder:text-text-secondary/70 focus:border-primary sm:px-6 sm:py-4 ${
        isDark ? 'border-white/10 bg-white/[0.08] text-white placeholder:text-white/65' :
        isSharp ? 'rounded-none border-black/10 bg-white text-foreground' :
        isVintage ? 'border-[#d4c5b3] bg-white/70 text-foreground' :
        'border-border bg-neutral text-foreground'
    }`;
    const labelClass = `ml-1 text-sm font-bold ${isDark ? 'text-white/70' : 'text-text-secondary'}`;

    const allowPlusOnes = wedding?.rsvp_allow_plus_ones !== false;
    const allowChildren = wedding?.rsvp_allow_children !== false;
    const enableSearch = wedding?.rsvp_search_guest_list !== false;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [duplicateError, setDuplicateError] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Guest search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchedGuest[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<SearchedGuest | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        guestName: '',
        guestEmail: '',
        attendance: 'Yes',
        numGuests: 1,
        mealPreference: '',
        dietaryDetails: '',
        message: '',
        plusOneNames: '',
        songRequest: '',
        childrenCount: 0,
        householdName: '',
        householdMembers: '',
        eventResponses: events.map((event) => ({ eventId: event.id, attendance: 'Yes' as const })) as RsvpEventResponse[],
    });

    const isAttending = formData.attendance !== 'No';

    // Debounced guest list search
    useEffect(() => {
        if (!enableSearch) return;
        const query = searchQuery.trim();
        if (query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/public/rsvp/search?weddingId=${encodeURIComponent(weddingId)}&q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.guests || []);
                    setIsDropdownOpen(true);
                }
            } catch (err) {
                console.warn('Guest search failed:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
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

    const handleSelectGuest = (guest: SearchedGuest) => {
        setSelectedGuest(guest);
        setIsDropdownOpen(false);
        setSearchQuery(guest.guestName);

        setFormData((prev) => ({
            ...prev,
            guestName: guest.guestName,
            attendance: guest.attendance === 'No' ? 'No' : 'Yes',
            numGuests: allowPlusOnes ? Math.max(1, guest.numGuests || 1) : 1,
            plusOneNames: allowPlusOnes ? (guest.plusOneName || '') : '',
            childrenCount: allowChildren ? (guest.childrenCount || 0) : 0,
            householdName: guest.householdName || '',
            householdMembers: guest.householdMembers?.length ? guest.householdMembers.join('\n') : '',
            mealPreference: guest.mealPreference || prev.mealPreference,
        }));
    };

    const handleClearSelectedGuest = () => {
        setSelectedGuest(null);
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

        try {
            const response = await fetch('/api/public/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId,
                    rsvpId: selectedGuest?.id,
                    guestName: formData.guestName.trim(),
                    guestEmail: formData.guestEmail.trim(),
                    attendance: formData.attendance,
                    numGuests: isAttending && allowPlusOnes ? formData.numGuests : 0,
                    mealPreference: formData.mealPreference,
                    dietaryDetails: formData.dietaryDetails,
                    message: formData.message,
                    plusOneNames: isAttending && allowPlusOnes ? formData.plusOneNames : '',
                    songRequest: formData.songRequest,
                    childrenCount: isAttending && allowChildren ? formData.childrenCount : 0,
                    householdName: formData.householdName.trim(),
                    householdMembers: isAttending ? formData.householdMembers.split(/\n|,/).map((name) => name.trim()).filter(Boolean) : [],
                    eventResponses: formData.eventResponses,
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

            setIsSubmitted(true);

            // Confetti
            const end = Date.now() + 3 * 1000;
            const colors = [wedding?.motif_color || '#D4AF37', '#ffffff', '#ffd700'];
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                (function frame() {
                    confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
                    confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
                    if (Date.now() < end) requestAnimationFrame(frame);
                })();
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 sm:p-10 border text-center ${visual.cardClass}`}>
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-serif mb-2 text-foreground">Thank You!</h3>
                <p className="text-text-secondary italic">Your response has been received. We can&apos;t wait to celebrate together!</p>
            </motion.div>
        );
    }

    return (
        <div className={`mx-auto w-full max-w-2xl p-0 sm:p-2 transition-colors ${
            isDark ? 'text-white' :
            isSharp ? 'text-[#352C2C]' :
            isVintage ? 'text-[#352C2C]' :
            'text-[#352C2C]'
        }`}>
            <h3 className="sr-only">RSVP for our Special Day</h3>

            {duplicateError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">You have already submitted an RSVP for this name. Please select your name from the search to update your response.</p>
                </div>
            )}

            {submitError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-red-600 text-sm">Submission Error</p>
                        <p className="text-xs text-red-600/70">{submitError}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left sm:space-y-6">
                {/* Searchable guest list / Selected Guest Header */}
                {selectedGuest ? (
                    <div className={`flex items-center justify-between rounded-2xl border p-4 shadow-xs ${isDark ? 'border-primary/30 bg-primary/10' : 'border-primary/20 bg-primary/5'}`}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-primary">Found on Guest List</p>
                                <p className="font-serif text-lg font-bold">{selectedGuest.guestName}</p>
                                {selectedGuest.householdName && (
                                    <p className={`text-xs ${isDark ? 'text-white/60' : 'text-text-secondary'}`}>Household: {selectedGuest.householdName}</p>
                                )}
                            </div>
                        </div>
                        <button
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
                            <input
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
                            {isDropdownOpen && searchResults.length > 0 && (
                                <motion.div
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
                                            <button
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
                                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
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
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className={`w-full rounded-xl py-1.5 text-center text-xs font-semibold text-text-secondary hover:text-foreground`}
                                        >
                                            Not listed above? Continue with &quot;{formData.guestName}&quot;
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className={labelClass}>Guest Full Name *</label>
                        <input
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
                        <label className={labelClass}>Email Address *</label>
                        {selectedGuest?.hasEmail && (
                            <span className="text-xs text-text-secondary">
                                Masked on file: {selectedGuest.maskedEmail}
                            </span>
                        )}
                    </div>
                    <input
                        required
                        type="email"
                        placeholder="For your RSVP confirmation"
                        value={formData.guestEmail}
                        onChange={(e) => setFormData((prev) => ({ ...prev, guestEmail: e.target.value }))}
                        className={fieldClass}
                    />
                </div>

                {/* Attendance & Guest Count */}
                <div className={`grid grid-cols-1 ${isAttending && allowPlusOnes ? 'md:grid-cols-2' : ''} gap-4`}>
                    <div className="space-y-2">
                        <label className={labelClass}>Will you attend?</label>
                        <select
                            value={formData.attendance}
                            onChange={(e) => {
                                const nextAttendance = e.target.value;
                                setFormData((prev) => ({
                                    ...prev,
                                    attendance: nextAttendance,
                                    ...(nextAttendance === 'No' ? { childrenCount: 0 } : {}),
                                }));
                            }}
                            className={fieldClass}
                        >
                            <option value="Yes">Yes, gladly!</option>
                            <option value="No">Regretfully, no.</option>
                        </select>
                    </div>

                    {isAttending && allowPlusOnes && (
                        <div className="space-y-2">
                            <label className={labelClass}>Number of Guests</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                inputMode="numeric"
                                placeholder="1"
                                value={formData.numGuests === 0 ? '' : formData.numGuests}
                                onChange={(e) => setFormData((prev) => ({ ...prev, numGuests: e.target.value === '' ? 0 : parseInt(e.target.value, 10) }))}
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
                        <input
                            placeholder="e.g. Jane Doe, John Smith"
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
                    <input
                        placeholder="e.g. The Santos Family"
                        value={formData.householdName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, householdName: e.target.value }))}
                        className={fieldClass}
                    />
                    <p className={`ml-1 text-xs ${isDark ? 'text-white/50' : 'text-text-secondary'}`}>
                        Optional. Use this when confirming RSVP on behalf of your family or household.
                    </p>
                </div>

                {isAttending && (formData.householdName || (allowPlusOnes && formData.numGuests > 1)) && (
                    <div className="space-y-2">
                        <label className={labelClass}>Household / Party Member Names</label>
                        <textarea
                            placeholder={'One name per line\nJamie Santos\nAvery Santos'}
                            value={formData.householdMembers}
                            onChange={(e) => setFormData((prev) => ({ ...prev, householdMembers: e.target.value }))}
                            className={`${fieldClass} min-h-24 resize-y`}
                        />
                        <p className={`ml-1 text-xs ${isDark ? 'text-white/50' : 'text-text-secondary'}`}>
                            Each family member will be recorded by name so the couple can arrange table groupings.
                        </p>
                    </div>
                )}

                {/* Event Responses */}
                {events.length > 0 && (
                    <fieldset className={`space-y-3 rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-neutral/50'}`}>
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
                                    <select
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
                                        <option value="Yes">Attending</option>
                                        <option value="Maybe">Maybe</option>
                                        <option value="No">Not attending</option>
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
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={formData.childrenCount === 0 ? '' : formData.childrenCount}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, childrenCount: e.target.value === '' ? 0 : parseInt(e.target.value, 10) }))}
                                    className={`${fieldClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className={labelClass}>Dietary Preference</label>
                            <select
                                value={formData.mealPreference}
                                onChange={(e) => setFormData((prev) => ({ ...prev, mealPreference: e.target.value }))}
                                className={fieldClass}
                            >
                                <option value="">Select...</option>
                                {DIETARY_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
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
                        <input
                            placeholder="Please describe your dietary requirements"
                            value={formData.dietaryDetails}
                            onChange={(e) => setFormData((prev) => ({ ...prev, dietaryDetails: e.target.value }))}
                            className={fieldClass}
                        />
                    </motion.div>
                )}

                {/* Song Request */}
                <div className="space-y-2">
                    <label className={`${labelClass} flex items-center gap-2`}>
                        <Music className="w-4 h-4 text-primary" /> Song Request
                    </label>
                    <input
                        placeholder="e.g. 'Dancing Queen' by ABBA"
                        value={formData.songRequest}
                        onChange={(e) => setFormData((prev) => ({ ...prev, songRequest: e.target.value }))}
                        className={fieldClass}
                    />
                </div>

                {/* Message for the Couple */}
                <div className="space-y-2">
                    <label className={labelClass}>Message for the Couple</label>
                    <textarea
                        placeholder="Write a sweet note..."
                        value={formData.message}
                        onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                        className={`${fieldClass} h-32 resize-none`}
                    />
                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? (
                        'Sending...'
                    ) : (
                        <>
                            Submit RSVP
                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
